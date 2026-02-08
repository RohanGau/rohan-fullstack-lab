import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { HTTP_HEADERS } from '@fullstack-lab/constants';
import logger from '../utils/logger';
import { redisRest } from '../lib/redis-rest';

type IdempotencyState = 'in_progress' | 'completed';
type IdempotencyBodyType = 'json' | 'text' | 'empty';

type IdempotencyRecord = {
  state: IdempotencyState;
  fingerprint: string;
  statusCode?: number;
  bodyType?: IdempotencyBodyType;
  body?: unknown;
  contentType?: string;
  createdAt: string;
};

type MemoryRecord = {
  value: IdempotencyRecord;
  expiresAt: number;
};

const memoryStore = new Map<string, MemoryRecord>();
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const IN_PROGRESS_TTL_SECONDS = toPositiveInt(process.env.IDEMPOTENCY_IN_PROGRESS_TTL_SECONDS, 120);
const COMPLETED_TTL_SECONDS = toPositiveInt(process.env.IDEMPOTENCY_TTL_SECONDS, 60 * 60 * 24);
const MAX_STORED_RESPONSE_BYTES = toPositiveInt(
  process.env.IDEMPOTENCY_MAX_RESPONSE_BYTES,
  64 * 1024
);

function toPositiveInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function cleanupMemoryStore(now = Date.now()) {
  for (const [key, record] of memoryStore.entries()) {
    if (record.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
}

function sanitizeIdempotencyKey(value: string): string {
  return value.trim().slice(0, 200);
}

function buildStoreKey(method: string, key: string): string {
  return `idempotency:${method.toUpperCase()}:${key}`;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const serialized = keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`);
  return `{${serialized.join(',')}}`;
}

function buildFingerprint(req: Request): string {
  const payload = {
    method: req.method,
    path: req.originalUrl,
    body: req.body ?? null,
    query: req.query ?? {},
  };
  return crypto.createHash('sha256').update(stableStringify(payload)).digest('hex');
}

async function getRecord(key: string): Promise<IdempotencyRecord | null> {
  if (redisRest) {
    try {
      return (await redisRest.get<IdempotencyRecord>(key)) ?? null;
    } catch (error) {
      logger.warn({ err: error, key }, 'Failed to read idempotency key from Redis');
      return null;
    }
  }

  cleanupMemoryStore();
  return memoryStore.get(key)?.value ?? null;
}

async function setRecord(key: string, value: IdempotencyRecord, ttlSeconds: number): Promise<void> {
  if (redisRest) {
    try {
      await redisRest.set(key, value as any, { ex: ttlSeconds });
      return;
    } catch (error) {
      logger.warn({ err: error, key }, 'Failed to write idempotency key to Redis');
      return;
    }
  }

  cleanupMemoryStore();
  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

async function deleteRecord(key: string): Promise<void> {
  if (redisRest) {
    try {
      await redisRest.del(key);
      return;
    } catch (error) {
      logger.warn({ err: error, key }, 'Failed to delete idempotency key from Redis');
      return;
    }
  }

  memoryStore.delete(key);
}

function normalizeBodyForStorage(
  bodyType: IdempotencyBodyType,
  body: unknown
): { bodyType: IdempotencyBodyType; body: unknown } {
  if (bodyType === 'empty') {
    return { bodyType: 'empty', body: null };
  }

  let serialized: string;
  if (bodyType === 'text') {
    serialized = String(body ?? '');
  } else {
    try {
      serialized = JSON.stringify(body);
    } catch {
      return { bodyType: 'empty', body: null };
    }
  }

  if (Buffer.byteLength(serialized, 'utf8') > MAX_STORED_RESPONSE_BYTES) {
    return { bodyType: 'empty', body: null };
  }

  return { bodyType, body };
}

function replayResponse(res: Response, record: IdempotencyRecord) {
  const statusCode = record.statusCode ?? 200;
  if (record.contentType) {
    res.setHeader('Content-Type', record.contentType);
  }
  res.setHeader(HTTP_HEADERS.IDEMPOTENCY_STATUS, 'replayed');
  res.setHeader('x-idempotency-replayed', 'true');

  if (record.bodyType === 'text') {
    return res.status(statusCode).send(String(record.body ?? ''));
  }

  if (record.bodyType === 'json') {
    return res.status(statusCode).json(record.body);
  }

  return res.status(statusCode).end();
}

export async function idempotencyMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!MUTATION_METHODS.has(req.method)) {
    return next();
  }

  const rawKey = req.header('Idempotency-Key') || req.header(HTTP_HEADERS.IDEMPOTENCY_KEY);
  if (!rawKey) {
    return next();
  }

  const idempotencyKey = sanitizeIdempotencyKey(rawKey);
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'INVALID_IDEMPOTENCY_KEY' });
  }

  req.idempotencyKey = idempotencyKey;
  res.setHeader('x-idempotency-key', idempotencyKey);

  const storeKey = buildStoreKey(req.method, idempotencyKey);
  const fingerprint = buildFingerprint(req);

  const existing = await getRecord(storeKey);

  if (existing) {
    if (existing.fingerprint !== fingerprint) {
      return res.status(409).json({
        error: 'IDEMPOTENCY_KEY_CONFLICT',
        message: 'This Idempotency-Key was already used with a different request payload.',
      });
    }

    if (existing.state === 'in_progress') {
      res.setHeader(HTTP_HEADERS.IDEMPOTENCY_STATUS, 'in_progress');
      return res.status(409).json({
        error: 'IDEMPOTENCY_REQUEST_IN_PROGRESS',
        message: 'A request with this Idempotency-Key is already being processed.',
      });
    }

    return replayResponse(res, existing);
  }

  await setRecord(
    storeKey,
    {
      state: 'in_progress',
      fingerprint,
      createdAt: new Date().toISOString(),
    },
    IN_PROGRESS_TTL_SECONDS
  );

  res.setHeader(HTTP_HEADERS.IDEMPOTENCY_STATUS, 'created');

  let capturedBodyType: IdempotencyBodyType = 'empty';
  let capturedBody: unknown = null;

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = ((body: unknown) => {
    capturedBodyType = 'json';
    capturedBody = body;
    return originalJson(body);
  }) as typeof res.json;

  res.send = ((body?: any) => {
    if (capturedBodyType === 'empty') {
      if (Buffer.isBuffer(body) || typeof body === 'string') {
        capturedBodyType = 'text';
        capturedBody = Buffer.isBuffer(body) ? body.toString('utf8') : body;
      } else if (body !== undefined && body !== null) {
        capturedBodyType = 'json';
        capturedBody = body;
      }
    }
    return originalSend(body);
  }) as typeof res.send;

  res.on('finish', async () => {
    try {
      if (res.statusCode >= 500) {
        await deleteRecord(storeKey);
        return;
      }

      const normalized = normalizeBodyForStorage(capturedBodyType, capturedBody);

      await setRecord(
        storeKey,
        {
          state: 'completed',
          fingerprint,
          statusCode: res.statusCode,
          bodyType: normalized.bodyType,
          body: normalized.body,
          contentType:
            typeof res.getHeader('Content-Type') === 'string'
              ? String(res.getHeader('Content-Type'))
              : undefined,
          createdAt: new Date().toISOString(),
        },
        COMPLETED_TTL_SECONDS
      );
    } catch (error) {
      logger.warn({ err: error, storeKey }, 'Failed to finalize idempotency record');
      await deleteRecord(storeKey);
    }
  });

  next();
}
