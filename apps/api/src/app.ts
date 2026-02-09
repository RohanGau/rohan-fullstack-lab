import process from 'process';
import express, { type RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { rateLimit, type RateLimitRequestHandler } from 'express-rate-limit';
import { API_VERSIONS, HTTP_HEADERS } from '@fullstack-lab/constants';
import type { ApiRuntimeConfig } from './config/runtime';
import todoRoutes from './routes/todoRoutes';
import blogRoutes from './routes/blogRoutes';
import contactRoutes from './routes/contactRoutes';
import profileRoutes from './routes/profileRoutes';
import projectRoutes from './routes/projectRoutes';
import uploadRoutes from './routes/uploadRoutes';
import slotRoutes from './routes/slotRoutes';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import agentRoutes from './routes/agentRoutes';
import { globalErrorHandler, jsonErrorHandler } from './utils';
import logger from './utils/logger';
import swaggerSpec from './swagger/swagger';
import { allowedOrigins } from './utils/constant';
import { sentryErrorHandler } from './utils/sentry';
import { createRedisRateLimitStore } from './lib/redis-rest';
import { requestContextMiddleware, requestLoggingMiddleware } from './middleware/requestContext';
import { requestTimeoutMiddleware } from './middleware/requestTimeout';
import { idempotencyMiddleware } from './middleware/idempotency';
import { auditLogMiddleware } from './middleware/auditLog';

function applyProxyTrust(app: express.Express, config: ApiRuntimeConfig): void {
  if (config.isProductionLike) {
    app.set('trust proxy', 1);
  }
}

function applySecurityAndCoreMiddleware(app: express.Express, config: ApiRuntimeConfig): void {
  app.use(requestContextMiddleware);
  app.use(requestLoggingMiddleware);
  app.use(requestTimeoutMiddleware(config.requestTimeoutMs));
  app.use(auditLogMiddleware);
  app.use(helmet());

  const generalRateLimitStore = createRedisRateLimitStore({
    prefix: 'rate-limit:general:',
    windowMs: config.rateLimitWindowMs,
  });
  const writeRateLimitStore = createRedisRateLimitStore({
    prefix: 'rate-limit:write:',
    windowMs: config.rateLimitWindowMs,
  });

  if (!generalRateLimitStore || !writeRateLimitStore) {
    if (config.isProductionLike) {
      logger.error(
        'FATAL: Upstash Redis is required for rate limiting in production/stage. ' +
          'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.'
      );
      process.exit(1);
    }

    logger.warn(
      'Upstash Redis is not configured for rate limiting. Falling back to in-memory store (single-instance only).'
    );
  }

  const generalLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.isProduction ? 500 : 5000,
    store: generalRateLimitStore,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      if (req.path.startsWith('/health')) return true;
      if (!config.isProduction && req.headers.origin?.includes('localhost')) return true;
      return false;
    },
  });

  const writeLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.isProduction ? 50 : 500,
    store: writeRateLimitStore,
    message: { error: 'Too many write requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'GET' || req.method === 'OPTIONS',
  });

  app.use(generalLimiter as unknown as RequestHandler);
  app.use(writeLimiter as unknown as RequestHandler);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        logger.warn({ origin }, 'CORS blocked request from origin');
        return callback(new Error('Not allowed by CORS'), false);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'Idempotency-Key', 'X-Request-Id'],
      exposedHeaders: [
        'X-Total-Count',
        'Content-Range',
        HTTP_HEADERS.REQUEST_ID,
        'X-Idempotency-Key',
        HTTP_HEADERS.IDEMPOTENCY_STATUS,
        HTTP_HEADERS.API_VERSION,
        'Deprecation',
        'Link',
      ],
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(jsonErrorHandler);
  app.use(idempotencyMiddleware);
}

function applyCacheControl(app: express.Express): void {
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  });
}

function registerRoutes(app: express.Express, config: ApiRuntimeConfig): void {
  app.use('/health', healthRoutes);

  app.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      message: 'Server is running',
      docs: '/api-docs',
      health: '/health',
      apiVersion: API_VERSIONS.CURRENT_PREFIX,
    });
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

  const apiV1Router = express.Router();
  apiV1Router.use('/auth', authRoutes);

  if (config.agentGatewayEnabled) {
    apiV1Router.use('/agent', agentRoutes);
  } else {
    logger.info('Agent gateway routes are disabled via AGENT_GATEWAY_ENABLED=false');
  }

  apiV1Router.use('/todos', todoRoutes);
  apiV1Router.use('/blogs', blogRoutes);
  apiV1Router.use('/profiles', profileRoutes);
  apiV1Router.use('/contact', contactRoutes);
  apiV1Router.use('/projects', projectRoutes);
  apiV1Router.use('/uploads', uploadRoutes);
  apiV1Router.use('/slots', slotRoutes);

  app.use(API_VERSIONS.CURRENT_PREFIX, apiV1Router);

  app.use(API_VERSIONS.LEGACY_PREFIX, (req, res, next) => {
    res.setHeader(HTTP_HEADERS.API_VERSION, API_VERSIONS.CURRENT);
    res.setHeader('Deprecation', 'true');
    res.setHeader('Link', `<${API_VERSIONS.CURRENT_PREFIX}>; rel="successor-version"`);
    next();
  });
  app.use(API_VERSIONS.LEGACY_PREFIX, apiV1Router);
}

function applyErrorHandlers(app: express.Express): void {
  app.use(sentryErrorHandler);
  app.use(globalErrorHandler);
}

export function createApp(config: ApiRuntimeConfig): express.Express {
  const app = express();

  applyProxyTrust(app, config);
  applySecurityAndCoreMiddleware(app, config);
  applyCacheControl(app);
  registerRoutes(app, config);
  applyErrorHandlers(app);

  return app;
}
