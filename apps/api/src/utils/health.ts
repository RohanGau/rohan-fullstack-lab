import mongoose from 'mongoose';
import logger from './logger';
import { redisRest } from '../lib/redis-rest';

/**
 * Health Check Utilities
 *
 * Liveness vs Readiness:
 * - Liveness: Is the process running? If not, restart it.
 * - Readiness: Can the app handle traffic? If not, don't route traffic to it.
 *
 * Use Cases:
 * - Kubernetes/Fly.io uses these to manage container lifecycle
 * - Load balancers use readiness to know when to route traffic
 * - Enables zero-downtime deployments
 */

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  checks: {
    [key: string]: {
      status: 'up' | 'down' | 'degraded';
      latency?: number;
      message?: string;
    };
  };
}

/**
 * Liveness check - Is the process alive?
 * Should always return true if the process is running.
 * Used by orchestrators to know when to restart the container.
 */
export function checkLiveness(): { alive: boolean; uptime: number } {
  return {
    alive: true,
    uptime: process.uptime(),
  };
}

/**
 * Readiness check - Can the app handle traffic?
 * Checks all dependencies (DB, Redis, external services).
 * Used by load balancers to know when to route traffic.
 */
export async function checkReadiness(): Promise<HealthStatus> {
  const checks: HealthStatus['checks'] = {};
  let overallStatus: HealthStatus['status'] = 'healthy';

  // Check MongoDB connection
  const mongoStart = Date.now();
  try {
    const mongoState = mongoose.connection.readyState;
    /**
     * Mongoose connection states:
     * 0 = disconnected
     * 1 = connected
     * 2 = connecting
     * 3 = disconnecting
     */
    if (mongoState === 1) {
      // Ping the database to ensure it's responsive
      await mongoose.connection.db?.admin().ping();
      checks.mongodb = {
        status: 'up',
        latency: Date.now() - mongoStart,
      };
    } else if (mongoState === 2) {
      checks.mongodb = {
        status: 'degraded',
        message: 'Connecting to MongoDB...',
      };
      overallStatus = 'degraded';
    } else {
      checks.mongodb = {
        status: 'down',
        message: `MongoDB disconnected (state: ${mongoState})`,
      };
      overallStatus = 'unhealthy';
    }
  } catch (error) {
    checks.mongodb = {
      status: 'down',
      latency: Date.now() - mongoStart,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
    overallStatus = 'unhealthy';
    logger.error({ error }, 'MongoDB health check failed');
  }

  // Check Redis connection (if configured)
  if (redisRest) {
    const redisStart = Date.now();
    try {
      await redisRest.ping();
      checks.redis = {
        status: 'up',
        latency: Date.now() - redisStart,
      };
    } catch (error) {
      checks.redis = {
        status: 'down',
        latency: Date.now() - redisStart,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      // Redis failure is not critical - rate limiting degrades to in-memory
      // Don't mark overall status as unhealthy, just degraded
      if (overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
      logger.warn({ error }, 'Redis health check failed - rate limiting will use in-memory store');
    }
  }

  // Add more checks here as needed:
  // - External API availability
  // - Disk space
  // - Memory usage

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  };
}

/**
 * Deep health check - More comprehensive check for debugging
 * Includes memory usage, event loop lag, etc.
 */
export async function checkDeepHealth(): Promise<HealthStatus & { system: object }> {
  const readiness = await checkReadiness();

  const memoryUsage = process.memoryUsage();

  return {
    ...readiness,
    system: {
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
        external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB',
      },
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
    },
  };
}
