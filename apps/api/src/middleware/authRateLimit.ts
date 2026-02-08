import { ipKeyGenerator, rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import { createRedisRateLimitStore } from '../lib/redis-rest';
import logger from '../utils/logger';

const rateLimitWindowMs = 15 * 60 * 1000; // 15 minutes
const isProduction = process.env.NODE_ENV === 'production';

// SECURITY: Brute-force protection for login endpoint
// Tracks both IP and username/email to prevent:
// 1. Single IP attacking multiple accounts
// 2. Distributed attack on single account

// Tier 1: Per-IP login rate limit (prevents single attacker)
const loginIpStore = createRedisRateLimitStore({
  prefix: 'rate-limit:login:ip:',
  windowMs: rateLimitWindowMs,
});

export const loginIpRateLimit: RateLimitRequestHandler = rateLimit({
  windowMs: rateLimitWindowMs,
  max: isProduction ? 10 : 100, // 10 login attempts per 15min per IP in prod
  store: loginIpStore,
  message: {
    error: 'Too many login attempts from this IP. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use IP as key
  keyGenerator: (req) => {
    return ipKeyGenerator(req.ip || 'unknown');
  },
});

// Tier 2: Per-account login rate limit (prevents credential stuffing on single account)
const loginAccountStore = createRedisRateLimitStore({
  prefix: 'rate-limit:login:account:',
  windowMs: rateLimitWindowMs,
});

export const loginAccountRateLimit: RateLimitRequestHandler = rateLimit({
  windowMs: rateLimitWindowMs,
  max: isProduction ? 5 : 50, // 5 login attempts per 15min per account in prod
  store: loginAccountStore,
  message: {
    error: 'Too many login attempts for this account. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use username or email as key (normalized)
  keyGenerator: (req) => {
    const { username, email } = req.body || {};
    if (email && typeof email === 'string') {
      return `email:${email.trim().toLowerCase()}`;
    }
    if (username && typeof username === 'string') {
      return `username:${username.trim().toLowerCase()}`;
    }
    // Fallback to IP if no username/email provided (will be caught by validation)
    return `fallback:${ipKeyGenerator(req.ip || 'unknown')}`;
  },
  // Skip incrementing on successful validation (only count failed attempts)
  skipSuccessfulRequests: true,
});

// Enforce Redis requirement for auth rate limiting in prod/stage
if (!loginIpStore || !loginAccountStore) {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'stage') {
    logger.error(
      'FATAL: Redis is required for auth rate limiting in production/stage. ' +
        'Cannot start without UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'
    );
    process.exit(1);
  }
  logger.warn('Auth rate limiting will use in-memory store (not recommended for production).');
}
