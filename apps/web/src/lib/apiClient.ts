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