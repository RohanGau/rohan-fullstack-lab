import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { HTTP_HEADERS } from '@fullstack-lab/constants';
import logger from '../utils/logger';

const MAX_REQUEST_ID_LENGTH = 128;

function resolveRequestId(req: Request): string {
  const incoming = req.headers[HTTP_HEADERS.REQUEST_ID];

  if (typeof incoming === 'string' && incoming.trim()) {
    return incoming.trim().slice(0, MAX_REQUEST_ID_LENGTH);
  }

  return randomUUID();
}

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = resolveRequestId(req);
  req.requestId = requestId;
  res.setHeader(HTTP_HEADERS.REQUEST_ID, requestId);
  next();
}

export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    if (req.path.startsWith('/health')) return;

    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    logger.info(
      {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
        ip: req.ip,
      },
      'HTTP request completed'
    );
  });

  next();
}
