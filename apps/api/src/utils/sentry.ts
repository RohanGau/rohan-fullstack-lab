/**
 * Sentry Error Tracking Configuration
 *
 * Sentry captures errors, exceptions, and performance data from your application.
 *
 * Why use Sentry?
 * - See errors as they happen in production
 * - Get stack traces with source maps
 * - Track error frequency and impact
 * - Get alerts when new errors occur
 * - Understand error context (user, request, etc.)
 *
 * Setup:
 * 1. Create account at https://sentry.io
 * 2. Create a new Node.js project
 * 3. Copy the DSN to your .env file
 */

import * as Sentry from '@sentry/node';
import logger from './logger';

/**
 * Initialize Sentry error tracking
 * Call this at app startup, before any other code
 */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    logger.info('Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,

    // Environment (production, staging, development)
    environment: process.env.NODE_ENV || 'development',

    // Release version (use git commit hash or package version)
    release: process.env.npm_package_version || '1.0.0',

    // Sample rate for performance monitoring (1.0 = 100%)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Sample rate for profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Integrations
    integrations: [
      // Automatically capture unhandled promise rejections
      Sentry.captureConsoleIntegration({ levels: ['error'] }),
    ],

    // Filter out sensitive data
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }

      // Remove sensitive data from request body
      if (event.request?.data) {
        const data =
          typeof event.request.data === 'string'
            ? JSON.parse(event.request.data)
            : event.request.data;

        // Redact sensitive fields
        const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
        sensitiveFields.forEach((field) => {
          if (data[field]) {
            data[field] = '[REDACTED]';
          }
        });

        event.request.data = JSON.stringify(data);
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Ignore common non-actionable errors
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      /^Network Error$/,
      /^Request aborted$/,
    ],
  });

  logger.info('Sentry error tracking initialized');
}

/**
 * Capture an exception manually
 * Use this for errors you catch but still want to track
 */
export function captureException(error: Error, context?: Record<string, unknown>): string {
  return Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message (non-error event)
 * Use for important events that aren't errors
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): string {
  return Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 * Call this when a user authenticates
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  Sentry.setUser(user);
}

/**
 * Add extra context to errors
 * This data will be attached to all subsequent errors
 */
export function setContext(name: string, context: Record<string, unknown>): void {
  Sentry.setContext(name, context);
}

/**
 * Add a breadcrumb (trail of events leading to error)
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Express error handler middleware for Sentry
 * Add this AFTER your routes but BEFORE your error handler
 */
export const sentryErrorHandler = Sentry.expressErrorHandler();

/**
 * Express request handler middleware for Sentry
 * Add this BEFORE your routes
 */
export const sentryRequestHandler = Sentry.expressIntegration();

/**
 * Flush all pending events before shutdown
 * Call this during graceful shutdown
 */
export async function flushSentry(timeout = 2000): Promise<boolean> {
  return Sentry.flush(timeout);
}

export default Sentry;
