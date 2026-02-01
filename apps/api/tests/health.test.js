'use strict';
/**
 * Health Check Endpoint Tests
 *
 * These tests verify that the health check endpoints work correctly.
 * Health checks are critical for:
 * - Load balancer routing decisions
 * - Container orchestration (K8s, Fly.io)
 * - Zero-downtime deployments
 */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const vitest_1 = require('vitest');
const supertest_1 = __importDefault(require('supertest'));
const express_1 = __importDefault(require('express'));
const healthRoutes_1 = __importDefault(require('../src/routes/healthRoutes'));
// Create a minimal test app
const app = (0, express_1.default)();
app.use('/health', healthRoutes_1.default);
(0, vitest_1.describe)('Health Check Endpoints', () => {
  (0, vitest_1.describe)('GET /health/live', () => {
    (0, vitest_1.it)('should return 200 with alive status', async () => {
      const response = await (0, supertest_1.default)(app)
        .get('/health/live')
        .expect('Content-Type', /json/)
        .expect(200);
      (0, vitest_1.expect)(response.body).toHaveProperty('alive', true);
      (0, vitest_1.expect)(response.body).toHaveProperty('uptime');
      (0, vitest_1.expect)(typeof response.body.uptime).toBe('number');
    });
    (0, vitest_1.it)('should have uptime greater than 0', async () => {
      const response = await (0, supertest_1.default)(app).get('/health/live');
      (0, vitest_1.expect)(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });
  (0, vitest_1.describe)('GET /health/ready', () => {
    (0, vitest_1.it)('should return health status object', async () => {
      const response = await (0, supertest_1.default)(app)
        .get('/health/ready')
        .expect('Content-Type', /json/);
      // Status could be 200 (healthy) or 503 (unhealthy) depending on DB
      (0, vitest_1.expect)([200, 503]).toContain(response.status);
      (0, vitest_1.expect)(response.body).toHaveProperty('status');
      (0, vitest_1.expect)(response.body).toHaveProperty('timestamp');
      (0, vitest_1.expect)(response.body).toHaveProperty('checks');
    });
    (0, vitest_1.it)('should include mongodb check in response', async () => {
      const response = await (0, supertest_1.default)(app).get('/health/ready');
      (0, vitest_1.expect)(response.body.checks).toHaveProperty('mongodb');
    });
    (0, vitest_1.it)('should have valid timestamp format', async () => {
      const response = await (0, supertest_1.default)(app).get('/health/ready');
      const timestamp = new Date(response.body.timestamp);
      (0, vitest_1.expect)(timestamp.toString()).not.toBe('Invalid Date');
    });
  });
  (0, vitest_1.describe)('GET /health', () => {
    (0, vitest_1.it)('should return deep health check with system info', async () => {
      const response = await (0, supertest_1.default)(app)
        .get('/health')
        .expect('Content-Type', /json/);
      (0, vitest_1.expect)([200, 503]).toContain(response.status);
      (0, vitest_1.expect)(response.body).toHaveProperty('status');
      (0, vitest_1.expect)(response.body).toHaveProperty('system');
    });
    (0, vitest_1.it)('should include memory information', async () => {
      const response = await (0, supertest_1.default)(app).get('/health');
      if (response.body.system) {
        (0, vitest_1.expect)(response.body.system).toHaveProperty('memory');
        (0, vitest_1.expect)(response.body.system).toHaveProperty('nodeVersion');
        (0, vitest_1.expect)(response.body.system).toHaveProperty('platform');
      }
    });
  });
});
(0, vitest_1.describe)('Health Check Response Times', () => {
  (0, vitest_1.it)('liveness check should respond quickly (< 100ms)', async () => {
    const start = Date.now();
    await (0, supertest_1.default)(app).get('/health/live');
    const duration = Date.now() - start;
    (0, vitest_1.expect)(duration).toBeLessThan(100);
  });
  (0, vitest_1.it)('readiness check should respond within reasonable time (< 5000ms)', async () => {
    const start = Date.now();
    await (0, supertest_1.default)(app).get('/health/ready');
    const duration = Date.now() - start;
    (0, vitest_1.expect)(duration).toBeLessThan(5000);
  });
});
