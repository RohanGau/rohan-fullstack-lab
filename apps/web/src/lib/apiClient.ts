import { BASE_URL } from './constant';

function buildUrl(endpoint: string) {
  return endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
}

function isAbortLike(err: any) {
  const msg = String(err?.message || '').toLowerCase();
  return (
    err?.name === 'AbortError' ||
    err?.code === 'ERR_CANCELED' ||
    msg.includes('abort') ||
    msg.includes('cancel')
  );
}

async function parseError(res: Response) {
  let msg = `HTTP ${res.status}`;
  try {
    const body = await res.clone().json();
    msg = body?.msg || body?.error || msg;
    const e: any = new Error(msg);
    e.status = res.status;
    e.body = body;
    return e;
  } catch {
    const e: any = new Error(msg);
    e.status = res.status;
    return e;
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = buildUrl(endpoint);
  try {
    const res = await fetch(url, {
      ...options,
      // include Accept header; leave Content-Type to the caller when sending bodies
      headers: { Accept: 'application/json', ...(options.headers || {}) },
      // if you use cookies/sessions, uncomment:
      // credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) throw await parseError(res);

    // parse JSON if available, otherwise return {} as T
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? ((await res.json()) as T) : ({} as T);
  } catch (err: any) {
    if (isAbortLike(err) || options?.signal?.aborted) {
      const e: any = new Error('aborted');
      e.name = 'AbortError';
      throw e;
    }
    // normalize to a consistent shape
    const e: any = new Error(err?.message || err?.msg || 'Network error');
    e.status = err?.status ?? 0;
    e.body = err?.body ?? err?.error ?? null;
    throw e;
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
    const data = ct.includes('application/json') ? ((await res.json()) as T) : ({} as T);

    const totalHeader = res.headers.get('X-Total-Count') || res.headers.get('x-total-count');
    const total = totalHeader ? Number(totalHeader) : Array.isArray(data) ? data.length : 0;

    return { data, total, headers: res.headers };
  } catch (err: any) {
    if (isAbortLike(err) || options?.signal?.aborted) {
      const e: any = new Error('aborted');
      e.name = 'AbortError';
      throw e;
    }
    const e: any = new Error(err?.message || err?.msg || 'Network error');
    e.status = err?.status ?? 0;
    e.body = err?.body ?? err?.error ?? null;
    throw e;
  }
}
