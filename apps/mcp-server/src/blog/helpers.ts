import {
  BLOG_STATUS_VALUES,
  HTTP_HEADERS,
  MCP_DEFAULTS,
  type BlogStatus,
  type IMcpApiMeta,
} from '../contracts.js';

export function normalizeBlogStatus(value: string | null): BlogStatus {
  if (value && BLOG_STATUS_VALUES.includes(value as BlogStatus)) {
    return value as BlogStatus;
  }
  return 'draft';
}

export function parseTotalCount(value: string | null): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export function toApiMeta(headers: Headers, idempotencyKey?: string): IMcpApiMeta {
  return {
    requestId: headers.get(HTTP_HEADERS.REQUEST_ID) || undefined,
    idempotencyKey,
    idempotencyStatus: headers.get(HTTP_HEADERS.IDEMPOTENCY_STATUS) || undefined,
  };
}

export function ensureMaxLimit(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit) || limit <= 0) {
    return MCP_DEFAULTS.BLOG_LIST_DEFAULT_LIMIT;
  }
  return Math.min(Math.floor(limit), MCP_DEFAULTS.BLOG_LIST_MAX_LIMIT);
}

export function normalizeBlogDto<T extends { status?: unknown }>(
  blog: T
): T & { status: BlogStatus } {
  return {
    ...blog,
    status: normalizeBlogStatus(String(blog.status ?? 'draft')),
  };
}

export function ensureDraftForMutation(
  blog: { id?: string; status?: unknown },
  mutation: 'update' | 'delete'
): void {
  const status = normalizeBlogStatus(String(blog.status ?? 'draft'));
  if (status === 'draft') return;

  const verb = mutation === 'update' ? 'updated' : 'deleted';
  throw new Error(
    `Only draft blogs can be ${verb} via this MCP tool. Blog ${blog.id ?? 'unknown'} has status=${status}.`
  );
}
