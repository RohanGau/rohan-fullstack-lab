import crypto from 'crypto';
import { redis } from './redis';
import logger from '../utils/logger';

const DEFAULT_TTL = 60 * 5;

function hash(obj: unknown) {
  return crypto.createHash('sha1').update(JSON.stringify(obj)).digest('hex').slice(0, 16);
}

async function getVersionNS(ns: string) {
  if (!redis) return 1;
  const v = await redis.get(`${ns}:version`);
  return v ? Number(v) : 1;
}

async function bumpVersionNS(ns: string) {
  if (!redis) return;
  await redis.incr(`${ns}:version`);
}

function keyForListNS(ns: string, v: number, qs: unknown) {
  return `${ns}:v${v}:list:${hash(qs)}`;
}
function keyForIdNS(ns: string, v: number, id: string) {
  return `${ns}:v${v}:id:${id}`;
}

async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    logger.warn({ e, key }, 'Redis GET failed (continuing without cache)');
    return null;
  }
}

async function cacheSet(key: string, value: unknown, ttl = DEFAULT_TTL) {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
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
