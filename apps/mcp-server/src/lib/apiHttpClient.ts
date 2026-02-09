import { randomUUID } from 'node:crypto';
import { HTTP_HEADERS, MCP_HEADERS } from '../contracts.js';

const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export class ApiHttpError extends Error {
  readonly status: number;
  readonly responseBody: unknown;

  constructor(message: string, status: number, responseBody: unknown) {
    super(message);
    this.name = 'ApiHttpError';
    this.status = status;
    this.responseBody = responseBody;
  }
}

export interface ApiHttpClientConfig {
  apiBaseUrl: string;
  apiBearerToken: string;
  actorId?: string;
  apiTimeoutMs: number;
}

export class ApiHttpClient {
  constructor(private readonly config: ApiHttpClientConfig) {}

  private buildUrl(pathname: string): string {
    return `${this.config.apiBaseUrl}${pathname}`;
  }

  async requestJson<T>(
    pathname: string,
    init: RequestInit,
    opts?: { idempotencyKey?: string }
  ): Promise<{ data: T; headers: Headers; status: number }> {
    const requestId = randomUUID();
    const timeoutController = new AbortController();
    const timeout = setTimeout(() => timeoutController.abort(), this.config.apiTimeoutMs);

    const headers = new Headers(init.headers || {});
    headers.set('Authorization', `Bearer ${this.config.apiBearerToken}`);
    headers.set(HTTP_HEADERS.REQUEST_ID, requestId);
    headers.set('Accept', JSON_HEADERS.Accept);

    if (this.config.actorId) {
      headers.set(MCP_HEADERS.ACTOR_ID, this.config.actorId);
    }

    if (opts?.idempotencyKey) {
      headers.set('Idempotency-Key', opts.idempotencyKey);
      headers.set(HTTP_HEADERS.IDEMPOTENCY_KEY, opts.idempotencyKey);
    }

    if (init.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', JSON_HEADERS['Content-Type']);
    }

    try {
      const response = await fetch(this.buildUrl(pathname), {
        ...init,
        headers,
        signal: timeoutController.signal,
      });

      const contentType = response.headers.get('Content-Type') || '';
      const parsedBody = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new ApiHttpError(
          `API request failed (${response.status}) for ${pathname}`,
          response.status,
          parsedBody
        );
      }

      return {
        data: parsedBody as T,
        headers: response.headers,
        status: response.status,
      };
    } catch (error) {
      if (error instanceof ApiHttpError) {
        throw error;
      }

      if ((error as { name?: string })?.name === 'AbortError') {
        throw new Error(`API request timed out after ${this.config.apiTimeoutMs}ms (${pathname})`);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function isApiHttpError(error: unknown): error is ApiHttpError {
  return error instanceof ApiHttpError;
}
