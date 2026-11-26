import type {
  AuthTokenPair,
  CurrentOperator,
  GoogleNonceResponse,
  GoogleSignInRequest,
  RefreshTokenRequest,
} from '@fullstack-lab/types';
import { API_PATHS } from '@fullstack-lab/constants';
import { config } from '../config';

const AUTH_URL = `${config.apiUrl}${API_PATHS.AUTH}`;

/** The API understood the request and said no (unregistered, deactivated, unverified...). */
export class SignInRefusedError extends Error {}
/** The refresh token was not accepted, or a request was refused even after a refresh: the session is over. */
export class SessionEndedError extends Error {}
/** The API understood the request and the Operator's Roles do not allow it (HTTP 403). */
export class ForbiddenError extends Error {}

async function postJson(path: string, body?: unknown): Promise<Response> {
  return fetch(`${AUTH_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function requestNonce(): Promise<string> {
  const response = await postJson('/google/nonce');
  if (!response.ok) throw new Error(`Nonce request failed (${response.status})`);
  const { nonce } = (await response.json()) as GoogleNonceResponse;
  return nonce;
}

export async function signInWithGoogle(idToken: string, nonce: string): Promise<AuthTokenPair> {
  const body: GoogleSignInRequest = { idToken, nonce };
  const response = await postJson('/google', body);
  if (response.status === 401 || response.status === 403) throw new SignInRefusedError();
  if (!response.ok) throw new Error(`Sign-in failed (${response.status})`);
  return (await response.json()) as AuthTokenPair;
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokenPair> {
  const body: RefreshTokenRequest = { refreshToken };
  const response = await postJson('/refresh', body);
  if (response.status === 401 || response.status === 403) throw new SessionEndedError();
  if (!response.ok) throw new Error(`Refresh failed (${response.status})`);
  return (await response.json()) as AuthTokenPair;
}

export async function parseCurrentOperator(response: Response): Promise<CurrentOperator> {
  if (!response.ok) throw new Error(`Identity request failed (${response.status})`);
  const operator = (await response.json()) as Partial<CurrentOperator> & { id: string };
  // The API leaves roles and permissions out for a session that is not an Operator's.
  return {
    ...operator,
    roles: operator.roles ?? [],
    permissions: operator.permissions ?? [],
  } as CurrentOperator;
}

const FORBIDDEN_MESSAGE =
  'You do not have permission to do that. Ask an administrator for a Role that includes it.';
const SESSION_ENDED_MESSAGE = 'Your session has ended. Sign in again.';
const UNREACHABLE_MESSAGE = 'Could not reach the server. Check your connection and try again.';

/** What to tell the Operator when a request to the API failed. */
export function describeApiError(error: unknown): string {
  if (error instanceof ForbiddenError) return FORBIDDEN_MESSAGE;
  if (error instanceof SessionEndedError) return SESSION_ENDED_MESSAGE;
  return UNREACHABLE_MESSAGE;
}

/** Best effort: whatever happens on the server, the Operator is signed out locally. */
export async function endServerSession(refreshToken: string): Promise<void> {
  try {
    const body: RefreshTokenRequest = { refreshToken };
    await postJson('/logout', body);
  } catch {
    // Network failure: the refresh token expires on its own; local sign-out proceeds.
  }
}
