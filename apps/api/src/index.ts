/// <reference path="./types/express/index.d.ts" />
import process from 'process';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import path from 'path';
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
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
import cors from 'cors';
import { connectDB } from './db';
import { globalErrorHandler, jsonErrorHandler } from './utils';
import logger from './utils/logger';
import swaggerSpec from './swagger/swagger';
import { allowedOrigins } from './utils/constant';
import { initSentry, sentryErrorHandler, flushSentry } from './utils/sentry';

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

// Helmet - Security headers
app.use(helmet());

// Rate limiting - Environment-aware approach
// Production: Strict limits to protect against abuse
// Stage/Dev: Disabled or very lenient for development workflow
const isProduction = process.env.NODE_ENV === 'production';

// Tier 1: General API rate limit
const generalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 500 : 5000, // 500 in prod, 5000 in stage/dev
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 50 : 500, // 50 in prod, 500 in stage/dev
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
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    exposedHeaders: ['X-Total-Count', 'Content-Range'],
  })
);

// ============================================
// Body Parsing (with size limits for security)
// ============================================
app.use(express.json({ limit: '1mb' })); // Prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// JSON parsing error handler
app.use(jsonErrorHandler);

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
  });
});

// ============================================
// API Documentation
// ============================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// ============================================
// API Routes
// ============================================
app.use('/api/todos', todoRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/slots', slotRoutes);

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
