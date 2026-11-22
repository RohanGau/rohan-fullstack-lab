import { Chip, Typography } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';
import styles from './Page.module.scss';

export function Account() {
  const { state } = useAuth();
  if (state.status !== 'signedIn') return null;
  const { operator } = state;

  return (
    <main className={styles.page}>
      <Typography variant="h4" component="h1">
        Account
      </Typography>
      <Typography>{operator.email}</Typography>
      <div>
        {operator.roles.map((role) => (
          <Chip key={role} label={role} size="small" className={styles.chip} />
        ))}
      </div>
    </main>
  );
}
