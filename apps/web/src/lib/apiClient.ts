import { BASE_URL } from "./constant";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
    });
    const isJson = response.headers.get('content-type')?.includes('application/json');
    if (response.ok) {
      return isJson ? response.json() : ({} as T);
    }
    const errorBody = isJson ? await response.json() : null;

    throw {
      status: response.status,
      msg: errorBody?.msg || response.statusText,
      error: errorBody?.error || null,
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw {
      msg: err?.msg || 'Network error',
      error: err?.error || null,
      status: err?.status || 500,
    };
  }
}


export async function apiFetchWithMeta<T>(
  endpoint: string, options: RequestInit = {}
): Promise<{ data: T; headers: Headers; total: number }> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const res = await fetch(url, { ...options, headers: { Accept: 'application/json', ...(options.headers||{}) } });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  if (!res.ok) {
    const body = isJson ? await res.json().catch(() => null) : null;
    throw { status: res.status, msg: body?.msg || res.statusText, error: body?.error || null };
  }
  const data = (isJson ? await res.json() : ({} as T)) as T;
  const totalHeader = res.headers.get('X-Total-Count') || res.headers.get('x-total-count');
  let total = totalHeader ? Number(totalHeader) : Array.isArray(data) ? data.length : 0;
  return { data, headers: res.headers, total };
}


