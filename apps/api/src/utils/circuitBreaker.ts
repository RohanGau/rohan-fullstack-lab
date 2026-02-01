import CircuitBreaker from 'opossum';
import logger from './logger';

/**
 * Circuit Breaker Pattern
 *
 * Prevents cascade failures by "breaking" the circuit when a service fails repeatedly.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, reject requests immediately (fail fast)
 * - HALF-OPEN: Testing if service recovered, allow limited requests
 *
 * Use Cases:
 * 1. Database queries - If MongoDB is slow/down, fail fast instead of queueing requests
 * 2. External APIs - If a third-party API is down, don't wait for timeouts
 * 3. Email service - If SMTP is down, queue emails instead of blocking requests
 *
 * Benefits:
 * - Prevents resource exhaustion (connection pools, memory)
 * - Faster failure response (no waiting for timeouts)
 * - Gives failing services time to recover
 * - Provides fallback behavior
 */

// Default circuit breaker options
const DEFAULT_OPTIONS: CircuitBreaker.Options = {
  timeout: 10000, // 10 seconds - if operation takes longer, consider it failed
  errorThresholdPercentage: 50, // Open circuit if 50% of requests fail
  resetTimeout: 30000, // 30 seconds - try again after this time
  volumeThreshold: 5, // Minimum requests before circuit can trip
};

// Store circuit breakers by name for reuse
const breakers = new Map<string, CircuitBreaker>();

/**
 * Create or get a circuit breaker for a specific operation
 *
 * @param name - Unique name for this circuit breaker
 * @param fn - The async function to wrap
 * @param options - Circuit breaker options
 * @returns CircuitBreaker instance
 *
 * @example
 * const dbBreaker = createCircuitBreaker('mongodb-query', async () => {
 *   return await Blog.find({});
 * });
 *
 * try {
 *   const blogs = await dbBreaker.fire();
 * } catch (error) {
 *   // Handle circuit open or operation failure
 * }
 */
export function createCircuitBreaker<T>(
  name: string,
  fn: (..._args: unknown[]) => Promise<T>,
  options: Partial<CircuitBreaker.Options> = {}
): CircuitBreaker<unknown[], T> {
  // Return existing breaker if already created
  const existing = breakers.get(name);
  if (existing) {
    return existing as CircuitBreaker<unknown[], T>;
  }

  const breaker = new CircuitBreaker(fn, {
    ...DEFAULT_OPTIONS,
    ...options,
    name,
  });

  // Log circuit breaker events
  breaker.on('open', () => {
    logger.warn(
      { circuit: name },
      `Circuit breaker OPENED - ${name} is failing, requests will be rejected`
    );
  });

  breaker.on('halfOpen', () => {
    logger.info({ circuit: name }, `Circuit breaker HALF-OPEN - Testing if ${name} has recovered`);
  });

  breaker.on('close', () => {
    logger.info({ circuit: name }, `Circuit breaker CLOSED - ${name} is healthy again`);
  });

  breaker.on('fallback', (result) => {
    logger.debug({ circuit: name, result }, `Circuit breaker fallback executed for ${name}`);
  });

  breaker.on('timeout', () => {
    logger.warn({ circuit: name }, `Circuit breaker timeout - ${name} operation took too long`);
  });

  breaker.on('reject', () => {
    logger.warn({ circuit: name }, `Circuit breaker rejected request - ${name} circuit is open`);
  });

  // Store for reuse
  breakers.set(name, breaker);

  return breaker;
}

/**
 * Get statistics for all circuit breakers
 * Useful for monitoring dashboards
 */
export function getCircuitBreakerStats(): Record<string, object> {
  const stats: Record<string, object> = {};

  breakers.forEach((breaker, name) => {
    stats[name] = {
      state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF-OPEN' : 'CLOSED',
      stats: breaker.stats,
    };
  });

  return stats;
}

/**
 * Get a specific circuit breaker by name
 */
export function getCircuitBreaker(name: string): CircuitBreaker | undefined {
  return breakers.get(name);
}

/**
 * Reset all circuit breakers (useful for testing)
 */
export function resetAllCircuitBreakers(): void {
  breakers.forEach((breaker) => {
    breaker.close();
  });
}

/**
 * Pre-configured circuit breaker for database operations
 */
export const DB_CIRCUIT_OPTIONS: Partial<CircuitBreaker.Options> = {
  timeout: 5000, // 5 seconds for DB operations
  errorThresholdPercentage: 50,
  resetTimeout: 10000, // 10 seconds before retry
  volumeThreshold: 3,
};

/**
 * Pre-configured circuit breaker for external API calls
 */
export const EXTERNAL_API_CIRCUIT_OPTIONS: Partial<CircuitBreaker.Options> = {
  timeout: 15000, // 15 seconds for external APIs
  errorThresholdPercentage: 50,
  resetTimeout: 60000, // 1 minute before retry
  volumeThreshold: 5,
};

/**
 * Pre-configured circuit breaker for email service
 */
export const EMAIL_CIRCUIT_OPTIONS: Partial<CircuitBreaker.Options> = {
  timeout: 30000, // 30 seconds for email (SMTP can be slow)
  errorThresholdPercentage: 50,
  resetTimeout: 120000, // 2 minutes before retry
  volumeThreshold: 3,
};

export default {
  createCircuitBreaker,
  getCircuitBreakerStats,
  getCircuitBreaker,
  resetAllCircuitBreakers,
  DB_CIRCUIT_OPTIONS,
  EXTERNAL_API_CIRCUIT_OPTIONS,
  EMAIL_CIRCUIT_OPTIONS,
};
