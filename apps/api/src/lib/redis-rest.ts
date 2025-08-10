// lib/redis-rest.ts
import { Redis } from '@upstash/redis';

// Build once. No sockets, so nothing to "connect".
export const redisRest =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
    : null;

export const hasRedis = !!redisRest;
