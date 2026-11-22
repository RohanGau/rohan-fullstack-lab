import type { Permission } from '@fullstack-lab/constants';
import { Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthProvider';
import styles from '../routes/Page.module.scss';

type Needs = Permission | readonly Permission[];

/**
 * The one way to ask "may this Operator do that?". A list means any one of them is enough.
 * This only decides what to show: the API remains the authority and refuses the rest.
 */
export function useCan(): (needs: Needs) => boolean {
  const { state } = useAuth();
  const held = new Set<string>(state.status === 'signedIn' ? state.operator.permissions : []);
  return (needs) => (typeof needs === 'string' ? [needs] : needs).some((p) => held.has(p));
}

/** Shows its children only to Operators who hold the Permission, e.g. a delete button. */
export function Can({
  anyOf,
  children,
  fallback = null,
}: {
  anyOf: Needs;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const can = useCan();
  return <>{can(anyOf) ? children : fallback}</>;
}

export function NotPermitted() {
  return (
    <section className={styles.page}>
      <Typography variant="h4" component="h1">
        You do not have access to this page
      </Typography>
      <Typography>Ask an administrator for a Role that includes this access.</Typography>
    </section>
  );
}

/** Wraps a whole screen: Operators without the Permission see a clear refusal instead. */
export function RequirePermission({ anyOf, children }: { anyOf: Needs; children: ReactNode }) {
  return (
    <Can anyOf={anyOf} fallback={<NotPermitted />}>
      {children}
    </Can>
  );
}
