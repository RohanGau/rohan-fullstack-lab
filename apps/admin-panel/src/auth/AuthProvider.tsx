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
import {
  SessionEndedError,
  UnauthorizedError,
  endServerSession,
  fetchCurrentOperator,
  refreshTokens,
} from './authApi';
import { currentGoogleIdentity } from './googleIdentity';
import { clearStoredRefreshToken, readStoredRefreshToken, storeRefreshToken } from './session';

type AuthState =
  | { status: 'restoring' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; operator: CurrentOperator };

export interface AuthContextValue {
  state: AuthState;
  /** Takes the tokens from a successful Google sign-in and loads who signed in. */
  completeSignIn(tokens: AuthTokenPair): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Refresh when this fraction of the access token's life has passed. */
const REFRESH_AT_FRACTION = 0.8;
/** After a background refresh could not reach the API, try again this soon. */
const RETRY_AFTER_MS = 15_000;

export function AuthProvider({ children }: { children: ReactNode }) {
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
    const request: Promise<string | null> = (async () => {
      let token = readStoredRefreshToken();
      // A second attempt exists only for the case where another tab got there first.
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
    })().finally(() => {
      if (inFlightRefresh.current === request) inFlightRefresh.current = null;
    });
    inFlightRefresh.current = request;
    return request;
  }, [adoptTokens, forgetSession, scheduleRefresh]);

  useEffect(() => {
    refreshSessionRef.current = refreshSession;
  });

  /** Loads the identity; an expired access token is refreshed once and retried. */
  const loadOperator = useCallback(async (): Promise<CurrentOperator | null> => {
    let token = accessToken.current;
    for (let attempt = 0; attempt < 2 && token; attempt += 1) {
      try {
        return await fetchCurrentOperator(token);
      } catch (error) {
        if (!(error instanceof UnauthorizedError)) throw error;
        token = await refreshSession();
      }
    }
    return null;
  }, [refreshSession]);

  const completeSignIn = useCallback(
    async (tokens: AuthTokenPair) => {
      const startedIn = generation.current;
      adoptTokens(tokens);
      try {
        const operator = await loadOperator();
        if (!operator) throw new Error('Could not load the signed-in Operator');
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

  const signOut = useCallback(async () => {
    const refreshToken = readStoredRefreshToken();
    generation.current += 1;
    inFlightRefresh.current = null;
    forgetSession();
    setState({ status: 'signedOut' });
    currentGoogleIdentity()?.disableAutoSelect();
    if (refreshToken) await endServerSession(refreshToken);
  }, [forgetSession]);

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
        setState(operator ? { status: 'signedIn', operator } : { status: 'signedOut' });
      } catch {
        setState({ status: 'signedOut' });
      }
    })();
  }, [refreshSession, loadOperator]);

  useEffect(() => () => clearTimeout(refreshTimer.current), []);

  const value = useMemo(
    () => ({ state, completeSignIn, signOut }),
    [state, completeSignIn, signOut]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
