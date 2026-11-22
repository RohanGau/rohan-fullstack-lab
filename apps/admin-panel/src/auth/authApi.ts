import type {
  AuthTokenPair,
  CurrentOperator,
  GoogleNonceResponse,
  GoogleSignInRequest,
  RefreshTokenRequest,
} from '@fullstack-lab/types';
import { config } from '../config';

const AUTH_URL = `${config.apiUrl}/api/v1/auth`;

/** The API understood the request and said no (unregistered, deactivated, unverified...). */
export class SignInRefusedError extends Error {}
/** The access token was not accepted (expired, revoked). */
export class UnauthorizedError extends Error {}
/** The refresh token was not accepted: the session is over. */
export class SessionEndedError extends Error {}

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

export async function fetchCurrentOperator(accessToken: string): Promise<CurrentOperator> {
  const response = await fetch(`${AUTH_URL}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (response.status === 401) throw new UnauthorizedError();
  if (!response.ok) throw new Error(`Identity request failed (${response.status})`);
  const operator = (await response.json()) as Partial<CurrentOperator> & { id: string };
  // The API leaves roles and permissions out for a session that is not an Operator's.
  return {
    ...operator,
    roles: operator.roles ?? [],
    permissions: operator.permissions ?? [],
  } as CurrentOperator;
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
