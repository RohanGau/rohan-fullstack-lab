import { NextFunction, Request, Response } from 'express';
import {
  API_VERSIONS,
  AUDIT_LOG_DEFAULTS,
  HTTP_HEADERS,
  MUTATION_HTTP_METHODS,
} from '@fullstack-lab/constants';
import type { MutationHttpMethod } from '@fullstack-lab/constants';
import AuditLog from '../models/AuditLog';
import logger from '../utils/logger';

const MUTATION_METHOD_SET = new Set<string>(MUTATION_HTTP_METHODS);
const EXCLUDED_PATHS = new Set<string>([
  '/health',
  '/api-docs',
  `${API_VERSIONS.CURRENT_PREFIX}/auth/token`,
  `${API_VERSIONS.CURRENT_PREFIX}/auth/login`,
  `${API_VERSIONS.CURRENT_PREFIX}/auth/refresh`,
  `${API_VERSIONS.CURRENT_PREFIX}/auth/logout`,
]);

function shouldSkipPath(pathname: string): boolean {
  return EXCLUDED_PATHS.has(pathname);
}

function isAuditEnabled(): boolean {
  return process.env.AUDIT_LOG_ENABLED !== 'false';
}

function normalizePath(path: string): string {
  if (!path) return '/';
  return path.split('?')[0] || '/';
}

function resolveResource(pathname: string): {
  resource: string;
  resourceId?: string;
} {
  const withoutV1 = pathname.startsWith(`${API_VERSIONS.CURRENT_PREFIX}/`)
    ? pathname.slice(API_VERSIONS.CURRENT_PREFIX.length + 1)
    : pathname;
  const withoutLegacy = withoutV1.startsWith(`${API_VERSIONS.LEGACY_PREFIX}/`)
    ? withoutV1.slice(API_VERSIONS.LEGACY_PREFIX.length + 1)
    : withoutV1;

  const [resource = 'unknown', resourceId] = withoutLegacy.split('/').filter(Boolean);
  return { resource, resourceId };
}

function getChangedFields(req: Request): string[] {
  const source = req.validatedBody ?? req.body;
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return [];
  }

  return Object.keys(source).slice(0, AUDIT_LOG_DEFAULTS.MAX_CHANGED_FIELDS);
}

function getQueryKeys(req: Request): string[] {
  if (!req.query || typeof req.query !== 'object') {
    return [];
  }

  return Object.keys(req.query).slice(0, AUDIT_LOG_DEFAULTS.MAX_QUERY_KEYS);
}

export function auditLogMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!isAuditEnabled()) {
    return next();
  }

  const method = req.method.toUpperCase();
  if (!MUTATION_METHOD_SET.has(method)) {
    return next();
  }

  const pathname = normalizePath(req.originalUrl || req.url || '/');
  if (shouldSkipPath(pathname)) {
    return next();
  }

  const startedAt = Date.now();

  res.on('finish', () => {
    if (!req.user) return;
    if (res.statusCode < 200 || res.statusCode >= 500) return;

    const { resource, resourceId } = resolveResource(pathname);
    const durationMs = Math.max(0, Date.now() - startedAt);
    const methodAsAudit = method as MutationHttpMethod;
    const userAgent = (req.get('user-agent') || '').slice(
      0,
      AUDIT_LOG_DEFAULTS.MAX_USER_AGENT_LENGTH
    );
    const path = pathname.slice(0, AUDIT_LOG_DEFAULTS.MAX_PATH_LENGTH);

    void AuditLog.create({
      requestId: req.requestId,
      method: methodAsAudit,
      path,
      resource,
      resourceId,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
      userAgent,
      actor: {
        id: req.user.id,
        role: req.user.role,
        email: req.user.email,
        username: req.user.username,
      },
      changedFields: getChangedFields(req),
      queryKeys: getQueryKeys(req),
      idempotencyKey: req.header(HTTP_HEADERS.IDEMPOTENCY_KEY) || undefined,
    }).catch((error: unknown) => {
      logger.error(
        { err: error, requestId: req.requestId, method, path: req.originalUrl },
        'Failed to persist audit log'
      );
    });
  });

  return next();
}
