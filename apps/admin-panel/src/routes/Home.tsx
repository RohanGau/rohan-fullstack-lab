import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { config } from '../config';
import styles from './Home.module.scss';

async function fetchApiLiveness(): Promise<{ alive: boolean }> {
  const response = await fetch(`${config.apiUrl}/health/live`);
  if (!response.ok) throw new Error(`API responded ${response.status}`);
  return response.json();
}

export function Home() {
  const liveness = useQuery({
    queryKey: ['api', 'liveness'],
    queryFn: fetchApiLiveness,
    retry: false,
  });

  return (
    <main className={styles.page}>
      <Typography variant="h4" component="h1">
        Admin panel
      </Typography>
      {liveness.isPending && <Typography>Checking API…</Typography>}
      {liveness.isSuccess && <Typography>API reachable</Typography>}
      {liveness.isError && <Typography color="error">API unreachable</Typography>}
    </main>
  );
}
