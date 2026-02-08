/// <reference path="./types/express/index.d.ts" />
import process from 'process';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import path from 'path';
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import { API_VERSIONS, HTTP_HEADERS } from '@fullstack-lab/constants';
import helmet from 'helmet';
import express from 'express';
import http from 'http';
import todoRoutes from './routes/todoRoutes';
import blogRoutes from './routes/blogRoutes';
import contactRoutes from './routes/contactRoutes';
import profileRoutes from './routes/profileRoutes';
import projectRoutes from './routes/projectRoutes';
import uploadRoutes from './routes/uploadRoutes';
import slotRoutes from './routes/slotRoutes';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import cors from 'cors';
import { connectDB } from './db';
import { globalErrorHandler, jsonErrorHandler } from './utils';
import logger from './utils/logger';
import swaggerSpec from './swagger/swagger';
import { allowedOrigins } from './utils/constant';
import { initSentry, sentryErrorHandler, flushSentry } from './utils/sentry';
import { createRedisRateLimitStore } from './lib/redis-rest';
import { requestContextMiddleware, requestLoggingMiddleware } from './middleware/requestContext';
import { requestTimeoutMiddleware } from './middleware/requestTimeout';
import { idempotencyMiddleware } from './middleware/idempotency';

// ============================================
// Environment Configuration
// ============================================
const env = process.env.NODE_ENV || 'development';
const envFile = env === 'development' ? '.env' : `.env.${env}`;

logger.info(`🌍 Loading environment variables from: ${envFile}`);
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// ============================================
// Initialize Sentry (MUST be before app setup)
// ============================================
initSentry();

const app = express();
const PORT = process.env.PORT || 5050;
const requestTimeoutFromEnv = Number(process.env.REQUEST_TIMEOUT_MS);
const REQUEST_TIMEOUT_MS =
  Number.isFinite(requestTimeoutFromEnv) && requestTimeoutFromEnv > 0
    ? requestTimeoutFromEnv
    : 30_000;

// ============================================
// Trust Proxy (Required for Fly.io, Cloudflare, etc.)
// ============================================
// This tells Express to trust X-Forwarded-* headers from the first proxy
// Required for:
// - Rate limiting to use real client IP (not proxy IP)
// - Correct req.ip and req.protocol values
// - Secure cookies to work behind HTTPS proxy
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'stage') {
  app.set('trust proxy', 1); // Trust first proxy (Fly.io)
}

// ============================================
// Security Middleware (MUST be first)
// ============================================
app.use(requestContextMiddleware);
app.use(requestLoggingMiddleware);
app.use(requestTimeoutMiddleware(REQUEST_TIMEOUT_MS));

// Helmet - Security headers
app.use(helmet());

// Rate limiting - Environment-aware approach
// Production: Strict limits to protect against abuse
// Stage/Dev: Disabled or very lenient for development workflow
const isProduction = process.env.NODE_ENV === 'production';
const rateLimitWindowMs = 15 * 60 * 1000;

const generalRateLimitStore = createRedisRateLimitStore({
  prefix: 'rate-limit:general:',
  windowMs: rateLimitWindowMs,
});
const writeRateLimitStore = createRedisRateLimitStore({
  prefix: 'rate-limit:write:',
  windowMs: rateLimitWindowMs,
});

if (!generalRateLimitStore || !writeRateLimitStore) {
  logger.warn(
    'Upstash Redis is not configured for rate limiting. Falling back to in-memory store (single-instance only).'
  );
}

// Tier 1: General API rate limit
const generalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: rateLimitWindowMs, // 15 minutes
  max: isProduction ? 500 : 5000, // 500 in prod, 5000 in stage/dev
  store: generalRateLimitStore,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    if (req.path.startsWith('/health')) return true;
    // Skip for localhost in non-production (development convenience)
    if (!isProduction && req.headers.origin?.includes('localhost')) return true;
    return false;
  },
});

// Tier 2: Stricter limit for write operations (POST, PUT, DELETE)
const writeLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: rateLimitWindowMs, // 15 minutes
  max: isProduction ? 50 : 500, // 50 in prod, 500 in stage/dev
  store: writeRateLimitStore,
  message: { error: 'Too many write requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET' || req.method === 'OPTIONS',
});

// Apply rate limiters
app.use(generalLimiter as unknown as express.RequestHandler);
app.use(writeLimiter as unknown as express.RequestHandler);

// ============================================
// CORS Configuration
// ============================================
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
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

// ============================================
// Body Parsing (with size limits for security)
// ============================================
app.use(express.json({ limit: '1mb' })); // Prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// JSON parsing error handler
app.use(jsonErrorHandler);

// Idempotency key support for mutation requests (POST/PUT/PATCH/DELETE)
app.use(idempotencyMiddleware);

// ============================================
// Cache Control Middleware
// Prevents overly aggressive caching of API responses
// ============================================
app.use('/api', (_req, res, next) => {
  // API responses should be revalidated, not cached indefinitely
  // This helps with stale data issues (like new blogs not showing)
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// ============================================
// Health Check Routes (no auth required)
// These must be before other routes for load balancer checks
// ============================================
app.use('/health', healthRoutes);

// Simple root endpoint
app.get('/', (_, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    docs: '/api-docs',
    health: '/health',
    apiVersion: API_VERSIONS.CURRENT_PREFIX,
  });
});

// ============================================
// API Documentation
// ============================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// ============================================
// API Routes
// ============================================
const apiV1Router = express.Router();
apiV1Router.use('/auth', authRoutes);
apiV1Router.use('/todos', todoRoutes);
apiV1Router.use('/blogs', blogRoutes);
apiV1Router.use('/profiles', profileRoutes);
apiV1Router.use('/contact', contactRoutes);
apiV1Router.use('/projects', projectRoutes);
apiV1Router.use('/uploads', uploadRoutes);
apiV1Router.use('/slots', slotRoutes);

// Preferred versioned API
app.use(API_VERSIONS.CURRENT_PREFIX, apiV1Router);

// Legacy alias for backward compatibility while clients migrate to /api/v1
app.use(API_VERSIONS.LEGACY_PREFIX, (req, res, next) => {
  res.setHeader(HTTP_HEADERS.API_VERSION, API_VERSIONS.CURRENT);
  res.setHeader('Deprecation', 'true');
  res.setHeader('Link', `<${API_VERSIONS.CURRENT_PREFIX}>; rel="successor-version"`);
  next();
});
app.use(API_VERSIONS.LEGACY_PREFIX, apiV1Router);

// ============================================
// Error Handling (MUST be last)
// ============================================

// Sentry error handler (captures errors before they reach globalErrorHandler)
app.use(sentryErrorHandler);

// Global error handler
app.use(globalErrorHandler);

// ============================================
// Server Startup with Graceful Shutdown
// ============================================
let server: http.Server;

async function startServer() {
  // Connect to database first
  await connectDB();

  server = app.listen(PORT, () => {
    logger.info(`✅ Server running at http://localhost:${PORT}`);
    logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    logger.info(`🏥 Health: http://localhost:${PORT}/health`);
  });

  server.on('error', (err) => {
    logger.error({ err }, '❌ Server failed to start');
    process.exit(1);
  });
}

// ============================================
// Graceful Shutdown
// Handles SIGTERM (Docker/K8s) and SIGINT (Ctrl+C)
// ============================================
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server?.close(() => {
    logger.info('HTTP server closed');
  });

  // Give existing requests time to complete (30 seconds max)
  const forceShutdownTimeout = setTimeout(() => {
    logger.warn('Forcing shutdown after timeout');
    process.exit(1);
  }, 30000);

  try {
    // Flush Sentry events before shutdown
    await flushSentry(2000);
    logger.info('Sentry events flushed');

    // Close database connections
    const mongoose = await import('mongoose');
    await mongoose.default.connection.close();
    logger.info('MongoDB connection closed');

    clearTimeout(forceShutdownTimeout);
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();
