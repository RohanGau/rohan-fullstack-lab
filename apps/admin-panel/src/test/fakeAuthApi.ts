import type { AuthTokenPair, CurrentOperator } from '@fullstack-lab/types';
import { http, HttpResponse } from 'msw';
import { REFRESH_TOKEN_STORAGE_KEY } from '../auth/session';
import { ROLE_ACCESS } from './roles';
import { API_URL, server } from './server';

export const OPERATOR_EMAIL = 'owner@example.com';

type Recorded = { url: string; body?: Record<string, string>; authorization?: string | null };

/**
 * The API's Operator auth contract, faked over HTTP: single-use nonces, Google sign-in,
 * rotating refresh tokens, a bearer-checked identity endpoint and logout.
 * Credentials 'good-token' sign in; 'unregistered-token' is refused.
 */
export function fakeAuthApi(
  options: { accessTtlSeconds?: number; access?: { roles: string[]; permissions: string[] } } = {}
) {
  let access = options.access ?? ROLE_ACCESS.super_admin;
  const operator = (): CurrentOperator => ({
    id: 'operator-1',
    role: 'admin',
    email: OPERATOR_EMAIL,
    ...access,
  });
  const accessTtlSeconds = options.accessTtlSeconds ?? 900;
  const issuedNonces = new Set<string>();
  const validAccess = new Set<string>();
  const validRefresh = new Set<string>();
  const calls: Record<'nonce' | 'signIn' | 'refresh' | 'me' | 'logout', Recorded[]> = {
    nonce: [],
    signIn: [],
    refresh: [],
    me: [],
    logout: [],
  };
  let counter = 0;
  let rejectedRefreshes = 0;
  let meOverride: { status: number; remaining: number } | null = null;
  let signInNetworkFailure = false;
  let logoutNetworkFailure = false;
  let meNetworkFailure = false;
  let refreshNetworkFailure = false;
  let otherTabRotates = false;
  let refreshGate: Promise<void> | null = null;
  let meGate: Promise<void> | null = null;

  function issuePair(): AuthTokenPair {
    counter += 1;
    const pair: AuthTokenPair = {
      accessToken: `access-${counter}`,
      refreshToken: `refresh-${counter}`,
      tokenType: 'Bearer',
      accessTokenTtlSeconds: accessTtlSeconds,
      refreshTokenTtlSeconds: 604800,
    };
    validAccess.add(pair.accessToken);
    validRefresh.add(pair.refreshToken);
    return pair;
  }

  server.use(
    http.post(`${API_URL}/api/v1/auth/google/nonce`, () => {
      calls.nonce.push({ url: '/auth/google/nonce' });
      counter += 1;
      const nonce = `nonce-${counter}`;
      issuedNonces.add(nonce);
      return HttpResponse.json({ nonce });
    }),
    http.post(`${API_URL}/api/v1/auth/google`, async ({ request }) => {
      const body = (await request.json()) as Record<string, string>;
      calls.signIn.push({ url: '/auth/google', body });
      if (signInNetworkFailure) return HttpResponse.error();
      const nonceOk = issuedNonces.delete(body.nonce ?? '');
      if (!nonceOk || body.idToken !== 'good-token') {
        return HttpResponse.json({ message: 'Sign-in refused' }, { status: 401 });
      }
      return HttpResponse.json(issuePair());
    }),
    http.post(`${API_URL}/api/v1/auth/refresh`, async ({ request }) => {
      const body = (await request.json()) as Record<string, string>;
      calls.refresh.push({ url: '/auth/refresh', body });
      if (refreshNetworkFailure) {
        refreshNetworkFailure = false;
        return HttpResponse.error();
      }
      if (otherTabRotates) {
        // Another tab used this token first: it is now spent, and the other tab stored a newer one.
        otherTabRotates = false;
        validRefresh.delete(body.refreshToken ?? '');
        validRefresh.add('refresh-other-tab');
        window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, 'refresh-other-tab');
        return HttpResponse.json({ message: 'Invalid or expired refresh token' }, { status: 401 });
      }
      if (!validRefresh.delete(body.refreshToken ?? '')) {
        rejectedRefreshes += 1;
        return HttpResponse.json({ message: 'Invalid or expired refresh token' }, { status: 401 });
      }
      const pair = issuePair();
      // The server has already acted; only the response is slow to arrive.
      if (refreshGate) await refreshGate;
      return HttpResponse.json(pair);
    }),
    http.get(`${API_URL}/api/v1/auth/me`, async ({ request }) => {
      const authorization = request.headers.get('authorization');
      calls.me.push({ url: '/auth/me', authorization });
      if (meNetworkFailure) return HttpResponse.error();
      if (meOverride && meOverride.remaining > 0) {
        meOverride.remaining -= 1;
        return HttpResponse.json({ message: 'Refused' }, { status: meOverride.status });
      }
      const token = authorization?.replace(/^Bearer /, '') ?? '';
      if (!validAccess.has(token)) {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      const body = operator();
      if (meGate) await meGate;
      return HttpResponse.json(body);
    }),
    http.post(`${API_URL}/api/v1/auth/logout`, async ({ request }) => {
      const body = (await request.json()) as Record<string, string>;
      calls.logout.push({ url: '/auth/logout', body });
      if (logoutNetworkFailure) return HttpResponse.error();
      validRefresh.delete(body.refreshToken ?? '');
      return new HttpResponse(null, { status: 204 });
    })
  );

  return {
    calls,
    /** Refresh requests the API refused, e.g. because the token had already been used. */
    rejectedRefreshCount: () => rejectedRefreshes,
    /** Whether the API would accept this bearer token right now (other fakes use it to answer 401). */
    acceptsAccessToken(token: string): boolean {
      return validAccess.has(token);
    },
    /** A refresh token the API will accept, as if left by an earlier visit. */
    seedRefreshToken(token = 'refresh-seed') {
      validRefresh.add(token);
      return token;
    },
    /** Access tokens stop working (they expired); refresh tokens still do. */
    expireAccessTokens() {
      validAccess.clear();
    },
    /** The next refresh request waits until the returned function is called. */
    holdNextRefresh(): () => void {
      let release!: () => void;
      refreshGate = new Promise<void>((resolve) => {
        release = () => {
          refreshGate = null;
          resolve();
        };
      });
      return release;
    },
    /** The next identity response is slow to arrive until the returned function is called. */
    holdNextMe(): () => void {
      let release!: () => void;
      meGate = new Promise<void>((resolve) => {
        release = () => {
          meGate = null;
          resolve();
        };
      });
      return release;
    },
    failNextRefreshNetwork() {
      refreshNetworkFailure = true;
    },
    /** The next refresh finds its token already used by another tab, which stored a newer one. */
    rotateInOtherTabOnNextRefresh() {
      otherTabRotates = true;
    },
    failMeNetwork() {
      meNetworkFailure = true;
    },
    rejectNextMeWith401() {
      meOverride = { status: 401, remaining: 1 };
    },
    /** The next `times` identity requests are answered with this status. */
    respondToMeWith(status: number, times = 1) {
      meOverride = { status, remaining: times };
    },
    /** The server changes what this Operator may do (an administrator edited their Roles). */
    changeAccess(next: { roles: string[]; permissions: string[] }) {
      access = next;
    },
    failSignInNetwork() {
      signInNetworkFailure = true;
    },
    failLogoutNetwork() {
      logoutNetworkFailure = true;
    },
  };
}
