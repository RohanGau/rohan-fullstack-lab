import type { HealthStatusResponse } from '@fullstack-lab/types';
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useCan } from '../access/permissions';
import { SECTION_GROUPS, SECTION_LIST, SECTIONS } from '../access/sections';
import { useAuth } from '../auth/AuthProvider';
import { config } from '../config';
import styles from './Page.module.scss';

const SECTION_DESCRIPTIONS: Record<string, string> = {
  [SECTIONS.blogs.path]: 'Write, edit, publish, and feature blog articles.',
  [SECTIONS.projects.path]: 'Manage portfolio projects, tech stack, and links.',
  [SECTIONS.profiles.path]: 'Maintain portfolio profiles, skills, and architecture focus.',
  [SECTIONS.assets.path]: 'Upload images/PDFs to Cloudflare R2 and remove objects.',
  [SECTIONS.contacts.path]: 'Review and manage incoming contact submissions.',
  [SECTIONS.slots.path]: 'Inspect, reschedule, cancel, or remove consultation slots.',
  [SECTIONS.operators.path]: 'Pre-register Operators, assign Roles, and deactivate access.',
  [SECTIONS.roles.path]: 'Manage Roles and bundled Permissions from the catalogue.',
};

async function fetchApiLiveness(): Promise<{ alive: boolean; uptime?: number }> {
  const response = await fetch(`${config.apiUrl}/health/live`);
  if (!response.ok) throw new Error(`API responded ${response.status}`);
  return response.json();
}

async function fetchDeepHealth(): Promise<HealthStatusResponse> {
  const response = await fetch(`${config.apiUrl}/health`);
  const body = (await response.json().catch(() => null)) as HealthStatusResponse | null;
  if (!body) throw new Error(`Health check failed (${response.status})`);
  return body;
}

function formatUptime(seconds?: number): string {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return '—';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export function Home() {
  const can = useCan();
  const { state } = useAuth();

  const liveness = useQuery({
    queryKey: ['api', 'liveness'],
    queryFn: fetchApiLiveness,
    retry: false,
  });

  const health = useQuery({
    queryKey: ['api', 'health'],
    queryFn: fetchDeepHealth,
    retry: false,
    enabled: liveness.isSuccess,
  });

  const visibleSections = SECTION_LIST.filter((section) => can(section.anyOf));

  return (
    <section className={styles.wide}>
      <div className={styles.headerRow}>
        <div>
          <Typography variant="h4" component="h1">
            Admin panel
          </Typography>
          <Typography color="text.secondary">
            {state.status === 'signedIn'
              ? `Signed in as ${state.operator.email ?? state.operator.id}`
              : 'System overview'}
          </Typography>
        </div>
        <div className={styles.chipWrap}>
          {state.status === 'signedIn' &&
            state.operator.roles.map((role) => (
              <Chip key={role} label={role} size="small" color="primary" variant="outlined" />
            ))}
        </div>
      </div>

      {liveness.isPending && <Typography>Checking API…</Typography>}
      {liveness.isSuccess && (
        <Alert severity={health.data?.status === 'unhealthy' ? 'warning' : 'success'}>
          API reachable — uptime {formatUptime(health.data?.uptime ?? liveness.data.uptime)}
        </Alert>
      )}
      {liveness.isError && <Alert severity="error">API unreachable</Alert>}

      {health.data && (
        <div className={styles.cardGrid}>
          {Object.entries(health.data.checks).map(([name, check]) => (
            <Card key={name}>
              <CardContent>
                <div className={styles.cardActionRow}>
                  <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                    {name}
                  </Typography>
                  <Chip
                    size="small"
                    label={check.status}
                    color={
                      check.status === 'up'
                        ? 'success'
                        : check.status === 'degraded'
                          ? 'warning'
                          : 'error'
                    }
                  />
                </div>
                {typeof check.latency === 'number' && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Latency: {check.latency} ms
                  </Typography>
                )}
                {check.message && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {check.message}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
          {health.data.system?.memory && (
            <Card>
              <CardContent>
                <Typography variant="subtitle1">Runtime Memory</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Heap: {health.data.system.memory.heapUsed} / {health.data.system.memory.heapTotal}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  RSS: {health.data.system.memory.rss}
                </Typography>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className={styles.sectionList}>
        {SECTION_GROUPS.map((group) => {
          const items = visibleSections.filter((s) => s.group === group);
          if (items.length === 0) return null;
          return (
            <Stack key={group} spacing={1.5}>
              <Typography variant="h6" component="h2">
                {group}
              </Typography>
              <div className={styles.cardGrid}>
                {items.map((section) => (
                  <Card key={section.path}>
                    <CardContent>
                      <Typography variant="subtitle1" component="h3">
                        {section.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {SECTION_DESCRIPTIONS[section.path] ?? ''}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button component={Link} to={section.path} size="small">
                        Open {section.label}
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </div>
            </Stack>
          );
        })}
      </div>
    </section>
  );
}
