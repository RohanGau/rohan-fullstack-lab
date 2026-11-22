import type { AuthTokenPair, CurrentOperator } from '@fullstack-lab/types';
import { http, HttpResponse } from 'msw';
import { REFRESH_TOKEN_STORAGE_KEY } from '../auth/session';
import { API_URL, server } from './server';

export const OPERATOR_EMAIL = 'owner@example.com';
const OPERATOR: CurrentOperator = {
  id: 'operator-1',
  role: 'admin',
  email: OPERATOR_EMAIL,
  roles: ['super_admin'],
  permissions: ['blog:create', 'contact:read'],
};

type Recorded = { url: string; body?: Record<string, string>; authorization?: string | null };

/**
 * The API's Operator auth contract, faked over HTTP: single-use nonces, Google sign-in,
 * rotating refresh tokens, a bearer-checked identity endpoint and logout.
 * Credentials 'good-token' sign in; 'unregistered-token' is refused.
 */
export function fakeAuthApi(options: { accessTtlSeconds?: number } = {}) {
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
  let rejectNextMe = false;
  let signInNetworkFailure = false;
  let logoutNetworkFailure = false;
  let meNetworkFailure = false;
  let refreshNetworkFailure = false;
  let otherTabRotates = false;
  let refreshGate: Promise<void> | null = null;

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
        return HttpResponse.json({ message: 'Invalid or expired refresh token' }, { status: 401 });
      }
      const pair = issuePair();
      // The server has already acted; only the response is slow to arrive.
      if (refreshGate) await refreshGate;
      return HttpResponse.json(pair);
    }),
    http.get(`${API_URL}/api/v1/auth/me`, ({ request }) => {
      const authorization = request.headers.get('authorization');
      calls.me.push({ url: '/auth/me', authorization });
      if (meNetworkFailure) return HttpResponse.error();
      if (rejectNextMe) {
        rejectNextMe = false;
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      const token = authorization?.replace(/^Bearer /, '') ?? '';
      if (!validAccess.has(token)) {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      return HttpResponse.json(OPERATOR);
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
    /** A refresh token the API will accept, as if left by an earlier visit. */
    seedRefreshToken(token = 'refresh-seed') {
      validRefresh.add(token);
      return token;
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
      rejectNextMe = true;
    },
    failSignInNetwork() {
      signInNetworkFailure = true;
    },
    failLogoutNetwork() {
      logoutNetworkFailure = true;
    },
  };
}
