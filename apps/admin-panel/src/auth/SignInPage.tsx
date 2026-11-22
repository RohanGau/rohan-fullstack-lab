import { Alert, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { config } from '../config';
import { SignInRefusedError, requestNonce, signInWithGoogle } from './authApi';
import { useAuth } from './AuthProvider';
import { loadGoogleIdentity } from './googleIdentity';
import { safeRedirect } from './redirect';
import styles from './SignInPage.module.scss';

const REFUSED_MESSAGE =
  'Sign-in was refused. Use the Google account an administrator registered for the Admin panel, then try again.';
const UNREACHABLE_MESSAGE =
  'Could not reach the server, so you are not signed in. Check your connection and try again.';

export function SignInPage({ redirect }: { redirect?: string }) {
  const auth = useAuth();
  const router = useRouter();
  const buttonHost = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(true);
  const { completeSignIn } = auth;

  // Already signed in (including right after sign-in): go where the Operator was headed.
  useEffect(() => {
    if (auth.state.status === 'signedIn') {
      // history is below the router, so the /admin base path has to be added back.
      router.history.replace(`${router.options.basepath ?? ''}${safeRedirect(redirect) ?? '/'}`);
    }
  }, [auth.state.status, redirect, router]);

  // One pass per attempt. A newer attempt (or leaving the page) cancels an older one, so
  // a slow nonce can never replace the callback bound to a fresher nonce.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setPreparing(true);
      try {
        // The API issues a single-use nonce that Google signs into the ID token.
        const nonce = await requestNonce();
        const google = await loadGoogleIdentity();
        if (cancelled) return;
        google.initialize({
          client_id: config.googleClientId,
          nonce,
          callback: async ({ credential }) => {
            setBusy(true);
            setProblem(null);
            try {
              await completeSignIn(await signInWithGoogle(credential, nonce));
            } catch (error) {
              setProblem(
                error instanceof SignInRefusedError ? REFUSED_MESSAGE : UNREACHABLE_MESSAGE
              );
              setBusy(false);
              setAttempt((current) => current + 1); // the nonce is spent: start over with a fresh one
            }
          },
        });
        if (buttonHost.current) {
          google.renderButton(buttonHost.current, { theme: 'outline', size: 'large', width: 280 });
        }
        setPreparing(false);
      } catch {
        if (cancelled) return;
        setProblem(UNREACHABLE_MESSAGE);
        setPreparing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt, completeSignIn]);

  return (
    <main className={styles.page}>
      <Card className={styles.card} variant="outlined">
        <CardContent className={styles.content}>
          <Typography variant="h4" component="h1">
            Sign in
          </Typography>
          <Typography color="text.secondary">
            Use the Google account an administrator registered for the Admin panel.
          </Typography>
          {problem && <Alert severity="error">{problem}</Alert>}
          <div className={styles.button} ref={buttonHost} aria-busy={busy || preparing} />
          {(busy || preparing) && <CircularProgress size={24} aria-label="Working" />}
          {!preparing && problem === UNREACHABLE_MESSAGE && !busy && (
            <Button
              onClick={() => {
                setProblem(null);
                setAttempt((current) => current + 1);
              }}
            >
              Try again
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
