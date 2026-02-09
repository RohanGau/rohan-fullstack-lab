import { Router, Request, Response } from 'express';
import { checkLiveness, checkReadiness, checkDeepHealth } from '../utils/health';
import { captureException, captureMessage } from '../utils/sentry';
import logger from '../utils/logger';

const router = Router();

/**
 * @openapi
 * /health/live:
 *   get:
 *     tags: [Health]
 *     summary: Liveness probe
 *     description: |
 *       Returns 200 if the process is alive.
 *       Used by Kubernetes/Fly.io to know when to restart the container.
 *
 *       **When this fails:** The orchestrator will restart the container.
 *     responses:
 *       200:
 *         description: Process is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alive:
 *                   type: boolean
 *                   example: true
 *                 uptime:
 *                   type: number
 *                   description: Process uptime in seconds
 *                   example: 3600
 */
router.get('/live', (_req: Request, res: Response) => {
  const health = checkLiveness();
  res.status(200).json(health);
});

/**
 * @openapi
 * /health/ready:
 *   get:
 *     tags: [Health]
 *     summary: Readiness probe
 *     description: |
 *       Returns 200 if the app can handle traffic (all dependencies are up).
 *       Returns 503 if any critical dependency is down.
 *
 *       Used by load balancers to know when to route traffic to this instance.
 *
 *       **When this fails:** Traffic will be routed to other healthy instances.
 *     responses:
 *       200:
 *         description: App is ready to handle traffic
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *       503:
 *         description: App is not ready (dependency down)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 */
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    const health = await checkReadiness();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error({ error }, 'Readiness check failed');
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed',
    });
  }
});

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Deep health check
 *     description: |
 *       Comprehensive health check including system metrics.
 *       Use for debugging and monitoring dashboards.
 *
 *       **Note:** This endpoint is more expensive than /live or /ready.
 *       Don't use it for frequent health checks.
 *     responses:
 *       200:
 *         description: Detailed health status
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const health = await checkDeepHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error({ error }, 'Deep health check failed');
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

/**
 * @openapi
 * components:
 *   schemas:
 *     HealthStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, unhealthy, degraded]
 *         timestamp:
 *           type: string
 *           format: date-time
 *         uptime:
 *           type: number
 *         checks:
 *           type: object
 *           additionalProperties:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [up, down, degraded]
 *               latency:
 *                 type: number
 *               message:
 *                 type: string
 */

/**
 * @openapi
 * /health/sentry-test:
 *   get:
 *     tags: [Health]
 *     summary: Test Sentry integration (requires admin token)
 *     description: |
 *       Triggers a test error to verify Sentry is working.
 *       Requires ADMIN_TOKEN in Authorization header.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test error sent to Sentry
 *       401:
 *         description: Unauthorized
 */
router.get('/sentry-test', (req: Request, res: Response) => {
  // Require admin token for security
  const authHeader = req.headers.authorization;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== adminToken) {
    res.status(401).json({ error: 'Unauthorized - Admin token required' });
    return;
  }

  const testType = req.query.type || 'error';

  if (testType === 'message') {
    // Send a test message (not an error)
    const eventId = captureMessage('Sentry test message from health endpoint', 'info');
    logger.info({ eventId }, 'Sentry test message sent');
    res.json({
      success: true,
      type: 'message',
      eventId,
      message: 'Test message sent to Sentry. Check your Sentry dashboard!',
    });
    return;
  }

  // Send a test error
  try {
    const testError = new Error('Sentry test error - This is a test from /health/sentry-test');
    (testError as Error & { customData: object }).customData = {
      triggeredBy: 'admin',
      endpoint: '/health/sentry-test',
      timestamp: new Date().toISOString(),
    };

    const eventId = captureException(testError, {
      source: 'sentry-test-endpoint',
      testMode: true,
    });

    logger.info({ eventId }, 'Sentry test error sent');

    res.json({
      success: true,
      type: 'error',
      eventId,
      message: 'Test error sent to Sentry. Check your Sentry dashboard!',
      dashboardUrl: 'https://sentry.io',
    });
  } catch (error) {
    logger.error({ error }, 'Failed to send test error to Sentry');
    res.status(500).json({
      success: false,
      error: 'Failed to send test error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
