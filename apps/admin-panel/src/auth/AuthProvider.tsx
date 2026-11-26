import type { AuthTokenPair, CurrentOperator } from '@fullstack-lab/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { API_PATHS } from '@fullstack-lab/constants';
import { config } from '../config';
import { useNotice } from '../shell/notice';
import {
  ForbiddenError,
  SessionEndedError,
  describeApiError,
  endServerSession,
  parseCurrentOperator,
  refreshTokens,
} from './authApi';
import { currentGoogleIdentity } from './googleIdentity';
import { clearStoredRefreshToken, readStoredRefreshToken, storeRefreshToken } from './session';

const REFRESH_LOCK_NAME = 'admin-panel.refresh-token';

async function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    return navigator.locks.request(REFRESH_LOCK_NAME, task);
  }
  return task();
}

type AuthState =
  | { status: 'restoring' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; operator: CurrentOperator };

export interface AuthContextValue {
  state: AuthState;
  /** Takes the tokens from a successful Google sign-in and loads who signed in. */
  completeSignIn(tokens: AuthTokenPair): Promise<void>;
  signOut(): Promise<void>;
  /**
   * A request to the API with the Operator's access token. An expired token is refreshed
   * once and the request retried; if the API still refuses it the Operator is signed out
   * (SessionEndedError). A 403 throws ForbiddenError. Use this for every authenticated call.
   */
  authorizedFetch(path: string, init?: RequestInit): Promise<Response>;
  /** Asks the API who is signed in and what they may do now (their Roles may have changed). */
  reloadOperator(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Refresh when this fraction of the access token's life has passed. */
const REFRESH_AT_FRACTION = 0.8;
/** After a background refresh could not reach the API, try again this soon. */
const RETRY_AFTER_MS = 15_000;
const ME_PATH = `${API_PATHS.AUTH}/me`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const { showNotice } = useNotice();
  const [state, setState] = useState<AuthState>({ status: 'restoring' });
  const accessToken = useRef<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inFlightRefresh = useRef<Promise<string | null> | null>(null);
  const restoreStarted = useRef(false);
  /**
   * Bumped whenever the session is ended on purpose. Work that started under an older
   * generation (a refresh or sign-in still in flight) must not bring the session back.
   */
  const generation = useRef(0);

  const forgetSession = useCallback(() => {
    clearTimeout(refreshTimer.current);
    accessToken.current = null;
    clearStoredRefreshToken();
  }, []);

  // Holds the newest reloadOperator, which is defined after authorizedFetch needs it.
  const reloadOperatorRef = useRef<() => Promise<void>>(async () => {});

  // Holds the newest refreshSession so timers never call a stale closure.
  const refreshSessionRef = useRef<() => Promise<string | null>>(async () => null);

  const scheduleRefresh = useCallback((delayMs: number) => {
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => void refreshSessionRef.current(), delayMs);
  }, []);

  const adoptTokens = useCallback(
    (tokens: AuthTokenPair) => {
      accessToken.current = tokens.accessToken;
      storeRefreshToken(tokens.refreshToken);
      scheduleRefresh(tokens.accessTokenTtlSeconds * 1000 * REFRESH_AT_FRACTION);
    },
    [scheduleRefresh]
  );

  /**
   * Exchanges the stored refresh token for new tokens. Refresh tokens are single use,
   * so concurrent callers share one request and never send the same token twice.
   * Resolves to the new access token, or null when there is no session (any more).
   */
  const refreshSession = useCallback((): Promise<string | null> => {
    if (inFlightRefresh.current) return inFlightRefresh.current;
    if (!readStoredRefreshToken()) return Promise.resolve(null);

    const startedIn = generation.current;
    const request: Promise<string | null> = withRefreshLock(async () => {
      let token = readStoredRefreshToken();
      if (!token) return null;
      // Read inside the cross-tab lock so if another tab just rotated, we already pick up the new token
      // instead of submitting the spent token (which revokes the whole session family on the server).
      // Keeping the post-401 storage retry covers browsers where Web Locks API is unavailable.
      for (let attempt = 0; attempt < 2 && token; attempt += 1) {
        try {
          const tokens = await refreshTokens(token);
          if (startedIn !== generation.current) {
            void endServerSession(tokens.refreshToken); // signed out meanwhile: do not keep these
            return null;
          }
          adoptTokens(tokens);
          return tokens.accessToken;
        } catch (error) {
          if (startedIn !== generation.current) return null;
          if (error instanceof SessionEndedError) {
            const latest = readStoredRefreshToken();
            if (latest && latest !== token) {
              token = latest; // another tab rotated it and stored a newer one: use that
              continue;
            }
            forgetSession();
            setState({ status: 'signedOut' });
            return null;
          }
          // The API could not be reached: keep the session and try again shortly.
          if (accessToken.current) scheduleRefresh(RETRY_AFTER_MS);
          return null;
        }
      }
      return null;
    }).finally(() => {
      if (inFlightRefresh.current === request) inFlightRefresh.current = null;
    });
    inFlightRefresh.current = request;
    return request;
  }, [adoptTokens, forgetSession, scheduleRefresh]);

  useEffect(() => {
    refreshSessionRef.current = refreshSession;
  });

  const signOut = useCallback(async () => {
    const refreshToken = readStoredRefreshToken();
    generation.current += 1;
    inFlightRefresh.current = null;
    forgetSession();
    setState({ status: 'signedOut' });
    currentGoogleIdentity()?.disableAutoSelect();
    if (refreshToken) await endServerSession(refreshToken);
  }, [forgetSession]);

  const authorizedFetch = useCallback(
    async (path: string, init: RequestInit = {}): Promise<Response> => {
      const startedIn = generation.current;
      const send = (token: string) => {
        const headers = new Headers(init.headers);
        headers.set('Authorization', `Bearer ${token}`);
        return fetch(`${config.apiUrl}${path}`, { ...init, headers });
      };
      // No access token (a failed background refresh): get one, or find the session is over.
      const noSession = () =>
        readStoredRefreshToken()
          ? new Error('Could not refresh the session')
          : new SessionEndedError();

      const token = accessToken.current ?? (await refreshSession());
      if (!token) throw noSession();

      let response = await send(token);
      if (response.status === 401) {
        const fresh = await refreshSession();
        if (!fresh) throw noSession();
        response = await send(fresh);
        if (response.status === 401) {
          // Only end the session this request belonged to, never a newer one.
          if (startedIn === generation.current) void signOut();
          throw new SessionEndedError();
        }
      }
      if (response.status === 403) {
        // Any screen's refused request is explained the same way, without each one asking.
        showNotice(describeApiError(new ForbiddenError()));
        // Their Roles may have changed since sign-in: re-read them so navigation and
        // controls catch up. (The identity request itself is the one that cannot recurse.)
        if (path !== ME_PATH) void reloadOperatorRef.current().catch(() => undefined);
        throw new ForbiddenError();
      }
      return response;
    },
    [refreshSession, signOut, showNotice]
  );

  const loadOperator = useCallback(
    async (): Promise<CurrentOperator> => parseCurrentOperator(await authorizedFetch(ME_PATH)),
    [authorizedFetch]
  );

  const reloadOperator = useCallback(async () => {
    const startedIn = generation.current;
    const operator = await loadOperator();
    if (startedIn !== generation.current) return; // signed out meanwhile: do not bring it back
    setState({ status: 'signedIn', operator });
  }, [loadOperator]);

  useEffect(() => {
    reloadOperatorRef.current = reloadOperator;
  });

  const completeSignIn = useCallback(
    async (tokens: AuthTokenPair) => {
      const startedIn = generation.current;
      adoptTokens(tokens);
      try {
        const operator = await loadOperator();
        if (startedIn !== generation.current) return;
        setState({ status: 'signedIn', operator });
      } catch (error) {
        if (startedIn === generation.current) {
          // Not signed in after all: do not leave a live session on the server either.
          const token = readStoredRefreshToken() ?? tokens.refreshToken;
          forgetSession();
          setState({ status: 'signedOut' });
          void endServerSession(token);
        }
        throw error;
      }
    },
    [adoptTokens, forgetSession, loadOperator]
  );

  // Reload: the access token is gone, so trade the stored refresh token for a new one.
  useEffect(() => {
    if (restoreStarted.current) return;
    restoreStarted.current = true;
    const startedIn = generation.current;
    void (async () => {
      const token = await refreshSession();
      if (startedIn !== generation.current) return;
      if (!token) {
        setState((current) => (current.status === 'restoring' ? { status: 'signedOut' } : current));
        return;
      }
      try {
        const operator = await loadOperator();
        if (startedIn !== generation.current) return;
        setState({ status: 'signedIn', operator });
      } catch {
        setState({ status: 'signedOut' });
      }
    })();
  }, [refreshSession, loadOperator]);

  useEffect(() => () => clearTimeout(refreshTimer.current), []);

  const value = useMemo(
    () => ({ state, completeSignIn, signOut, authorizedFetch, reloadOperator }),
    [state, completeSignIn, signOut, authorizedFetch, reloadOperator]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
