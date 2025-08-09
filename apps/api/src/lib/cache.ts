// lib/cache.ts
import crypto from 'crypto';
import logger from '../utils/logger';
import { redisRest } from './redis-rest';

const DEFAULT_TTL = 60 * 5; // 5 minutes

const hash = (obj: unknown) =>
  crypto.createHash('sha1').update(JSON.stringify(obj)).digest('hex').slice(0, 16);

const nsKey = (ns: string) => `${ns}:version`;

async function getVersionNS(ns: string) {
  if (!redisRest) return 1;
  try {
    const v = await redisRest.get<number>(nsKey(ns));
    return v ? Number(v) : 1;
  } catch (e) {
    logger.warn({ e, ns }, 'Redis GET version failed (continuing without cache)');
    return 1;
  }
}

async function bumpVersionNS(ns: string) {
  if (!redisRest) return;
  try {
    await redisRest.incr(nsKey(ns));
  } catch (e) {
    logger.warn({ e, ns }, 'Redis INCR version failed (continuing without cache)');
  }
}

function keyForListNS(ns: string, v: number | string, qs: unknown) {
  return `${ns}:v${v}:list:${hash(qs)}`;
}
function keyForIdNS(ns: string, v: number | string, id: string) {
  return `${ns}:v${v}:id:${id}`;
}

async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redisRest) return null;
  try {
    // @upstash/redis will parse JSON automatically if it was stored as JSON
    return (await redisRest.get<T>(key)) ?? null;
  } catch (e) {
    logger.warn({ e, key }, 'Redis GET failed (continuing without cache)');
    return null;
  }
}

async function cacheSet(key: string, value: unknown, ttl = DEFAULT_TTL) {
  if (!redisRest) return;
  try {
    // Upstash REST accepts objects directly and stores JSON under the hood
    await redisRest.set(key, value as any, { ex: ttl });
  } catch (e) {
    logger.warn({ e, key }, 'Redis SET failed (continuing without cache)');
  }
}

export const cache = {
  DEFAULT_TTL,
  getVersionNS,
  bumpVersionNS,
  keyForListNS,
  keyForIdNS,
  get: cacheGet,
  set: cacheSet,
};
