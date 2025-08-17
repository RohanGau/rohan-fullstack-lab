import { BASE_URL } from './constant';

type Json = unknown;

export interface ApiError extends Error {
  status: number;
  body?: Json | null;
}

function buildUrl(endpoint: string) {
  return endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
}

function toLowerSafe(v: unknown) {
  return (typeof v === 'string' ? v : String(v ?? '')).toLowerCase();
}

function isAbortLike(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;

  const e = err as { name?: string; code?: string; message?: string };
  const msg = toLowerSafe(e.message);
  return (
    e.name === 'AbortError' ||
    e.code === 'ERR_CANCELED' ||
    msg.includes('abort') ||
    msg.includes('cancel')
  );
}

function makeApiError(
  message: string,
  extras?: Partial<Pick<ApiError, 'status' | 'body'>>
): ApiError {
  const e = new Error(message) as ApiError;
  e.name = 'ApiError';
  e.status = extras?.status ?? 0;
  e.body = extras?.body;
  return e;
}

async function parseError(res: Response): Promise<ApiError> {
  let msg = `HTTP ${res.status}`;
  try {
    const body: Json = await res.clone().json();
    // try common keys from APIs
    const maybeMsg =
      (typeof body === 'object' &&
        body &&
        'msg' in body &&
        (body as Record<string, unknown>).msg) ||
      (typeof body === 'object' &&
        body &&
        'error' in body &&
        (body as Record<string, unknown>).error);

    if (typeof maybeMsg === 'string' && maybeMsg.trim()) msg = maybeMsg;
    return makeApiError(msg, { status: res.status, body });
  } catch {
    return makeApiError(msg, { status: res.status });
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = buildUrl(endpoint);
  try {
    const res = await fetch(url, {
      ...options,
      headers: { Accept: 'application/json', ...(options.headers || {}) },
      // credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) throw await parseError(res);

    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? ((await res.json()) as T) : ({} as T);
  } catch (err: unknown) {
    if (isAbortLike(err) || options?.signal?.aborted) {
      const aborted = makeApiError('aborted', { status: 0 });
      aborted.name = 'AbortError';
      throw aborted;
    }

    const message =
      err instanceof Error ? err.message : typeof err === 'string' ? err : 'Network error';

    const status = (err as Partial<ApiError>)?.status ?? 0;
    const body =
      (err as Partial<ApiError>)?.body ??
      (typeof err === 'object' && err && 'error' in (err as Record<string, unknown>)
        ? (err as Record<string, unknown>).error
        : null);

    throw makeApiError(message, { status, body });
  }
}

export async function apiFetchWithMeta<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T; total: number; headers: Headers }> {
  const url = buildUrl(endpoint);
  try {
    const res = await fetch(url, {
      ...options,
      headers: { Accept: 'application/json', ...(options.headers || {}) },
      // credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) throw await parseError(res);

    const ct = res.headers.get('content-type') || '';
    const data: T = ct.includes('application/json') ? ((await res.json()) as T) : ({} as T);

    const totalHeader = res.headers.get('X-Total-Count') || res.headers.get('x-total-count');
    const total = totalHeader ? Number(totalHeader) : Array.isArray(data) ? data.length : 0;

    return { data, total, headers: res.headers };
  } catch (err: unknown) {
    if (isAbortLike(err) || options?.signal?.aborted) {
      const aborted = makeApiError('aborted', { status: 0 });
      aborted.name = 'AbortError';
      throw aborted;
    }

    const message =
      err instanceof Error ? err.message : typeof err === 'string' ? err : 'Network error';

    const status = (err as Partial<ApiError>)?.status ?? 0;
    const body =
      (err as Partial<ApiError>)?.body ??
      (typeof err === 'object' && err && 'error' in (err as Record<string, unknown>)
        ? (err as Record<string, unknown>).error
        : null);

    throw makeApiError(message, { status, body });
  }
}
