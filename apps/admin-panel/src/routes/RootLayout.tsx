import { CircularProgress } from '@mui/material';
import { Navigate, Outlet, useRouterState } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthProvider';
import { Shell } from '../shell/Shell';
import styles from './Page.module.scss';

/** Signed-out visitors can only see sign-in; everything else waits for a session. */
export function RootLayout() {
  const { state } = useAuth();
  const location = useRouterState({ select: (s) => s.location });
  const onSignIn = location.pathname === '/sign-in';

  if (state.status === 'restoring') {
    return (
      <main className={styles.page}>
        <CircularProgress aria-label="Restoring your session" />
      </main>
    );
  }

  if (state.status === 'signedOut' && !onSignIn) {
    return (
      <Navigate
        to="/sign-in"
        search={{ redirect: `${location.pathname}${location.searchStr}` }}
        replace
      />
    );
  }

  return onSignIn ? <Outlet /> : <Shell />;
}
