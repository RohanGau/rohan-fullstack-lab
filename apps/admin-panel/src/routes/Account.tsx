import { Alert, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { ForbiddenError, describeApiError } from '../auth/authApi';
import { useAuth } from '../auth/AuthProvider';
import styles from './Page.module.scss';

type Outcome = { kind: 'done' } | { kind: 'failed'; message: string };

export function Account() {
  const { state, reloadOperator } = useAuth();
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  if (state.status !== 'signedIn') return null;
  const { operator } = state;
  const count = operator.permissions.length;

  async function reload() {
    setBusy(true);
    setOutcome(null);
    try {
      await reloadOperator();
      setOutcome({ kind: 'done' });
    } catch (error) {
      // A refusal (403) is already explained by the panel-wide notice.
      if (!(error instanceof ForbiddenError)) {
        setOutcome({ kind: 'failed', message: describeApiError(error) });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.page}>
      <Typography variant="h4" component="h1">
        Account
      </Typography>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <div>
              <Typography variant="overline" color="text.secondary">
                Signed-in Operator
              </Typography>
              <Typography variant="h6">{operator.email ?? operator.id}</Typography>
            </div>
            <div>
              <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
                Assigned Roles
              </Typography>
              <div className={styles.chipWrap}>
                {operator.roles.map((role) => (
                  <Chip key={role} label={role} size="small" color="primary" variant="outlined" />
                ))}
              </div>
            </div>
            <div>
              <Typography color="text.secondary" gutterBottom>
                {count} {count === 1 ? 'permission' : 'permissions'}
              </Typography>
              <div className={styles.chipWrap}>
                {operator.permissions.map((perm) => (
                  <Chip key={perm} label={perm} size="small" />
                ))}
              </div>
            </div>
            <div>
              <Button variant="outlined" onClick={() => void reload()} disabled={busy}>
                Reload access
              </Button>
            </div>
          </Stack>
        </CardContent>
      </Card>
      {outcome?.kind === 'done' && (
        <Alert severity="success" role="status">
          Access reloaded.
        </Alert>
      )}
      {outcome?.kind === 'failed' && <Alert severity="error">{outcome.message}</Alert>}
    </section>
  );
}
