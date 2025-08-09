import Redis from 'ioredis';

let redis: Redis | null = null;
const url = process.env.REDIS_URL;

if (url) {
  redis = new Redis(url, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: false,
    lazyConnect: false,
  });
  redis.on('error', (e) => console.error('Redis error', e));
}

export { redis };
export const hasRedis = !!redis;
