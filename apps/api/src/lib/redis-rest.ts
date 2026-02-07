import { Redis } from '@upstash/redis';
import type { IncrementResponse, Options, Store } from 'express-rate-limit';
import logger from '../utils/logger';

// Build once. No sockets, so nothing to "connect".
export const redisRest =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
    : null;

export const hasRedis = !!redisRest;

type RateLimitStoreOptions = {
  prefix: string;
  windowMs: number;
};

class UpstashRateLimitStore implements Store {
  public localKeys = false;
  public prefix: string;
  private windowMs: number;

  constructor({ prefix, windowMs }: RateLimitStoreOptions) {
    this.prefix = prefix;
    this.windowMs = windowMs;
  }

  public init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  public async get(key: string): Promise<IncrementResponse | undefined> {
    if (!redisRest) return undefined;

    const prefixedKey = this.prefixedKey(key);
    const totalHits = Number((await redisRest.get<number>(prefixedKey)) ?? 0);

    if (!totalHits) return undefined;

    const ttlMs = Number(await redisRest.pttl(prefixedKey));
    const resetTime =
      Number.isFinite(ttlMs) && ttlMs > 0
        ? new Date(Date.now() + ttlMs)
        : new Date(Date.now() + this.windowMs);

    return { totalHits, resetTime };
  }

  public async increment(key: string): Promise<IncrementResponse> {
    if (!redisRest) {
      return { totalHits: 1, resetTime: new Date(Date.now() + this.windowMs) };
    }

    const prefixedKey = this.prefixedKey(key);
    const totalHits = Number(await redisRest.incr(prefixedKey));

    if (totalHits === 1) {
      await redisRest.pexpire(prefixedKey, this.windowMs);
    }

    const ttlMs = Number(await redisRest.pttl(prefixedKey));
    const resetTime =
      Number.isFinite(ttlMs) && ttlMs > 0
        ? new Date(Date.now() + ttlMs)
        : new Date(Date.now() + this.windowMs);

    return { totalHits, resetTime };
  }

  public async decrement(key: string): Promise<void> {
    if (!redisRest) return;

    const prefixedKey = this.prefixedKey(key);
    const totalHits = Number(await redisRest.decr(prefixedKey));

    if (totalHits <= 0) {
      await redisRest.del(prefixedKey);
    }
  }

  public async resetKey(key: string): Promise<void> {
    if (!redisRest) return;
    await redisRest.del(this.prefixedKey(key));
  }

  private prefixedKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}

export function createRedisRateLimitStore(
  options: RateLimitStoreOptions
): UpstashRateLimitStore | undefined {
  if (!redisRest) return undefined;

  logger.info(
    { prefix: options.prefix, windowMs: options.windowMs },
    'Using Upstash Redis store for rate limiting'
  );
  return new UpstashRateLimitStore(options);
}
