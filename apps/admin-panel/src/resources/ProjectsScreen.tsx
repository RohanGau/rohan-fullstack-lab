import { PERMISSIONS } from '@fullstack-lab/constants';
import { Button } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useMemo, useState, lazy, Suspense } from 'react';
import { Can, RequirePermission } from '../access/permissions';
import { SECTIONS } from '../access/sections';
import type { ListState } from './listState';
import { projectsConfig, projectsListSearch, type ProjectRow } from './projects';
import { ResourceList } from './ResourceList';

const ProjectFormDialog = lazy(() =>
  import('./ProjectFormDialog').then((m) => ({ default: m.ProjectFormDialog }))
);

export function ProjectsScreen() {
  const search = useSearch({ from: SECTIONS.projects.path });
  const navigate = useNavigate({ from: SECTIONS.projects.path });
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectRow | null>(null);

  const state = useMemo(() => projectsListSearch.toState(search), [search]);
  const onStateChange = useCallback(
    (next: ListState) => void navigate({ search: projectsListSearch.toSearch(next) }),
    [navigate]
  );

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [projectsConfig.endpoint] });
  }, [queryClient]);

  return (
    <RequirePermission anyOf={SECTIONS.projects.anyOf}>
      <ResourceList
        config={projectsConfig}
        state={state}
        onStateChange={onStateChange}
        onEdit={setEditing}
        headerActions={
          <Can anyOf={PERMISSIONS.PROJECT_CREATE}>
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              New project
            </Button>
          </Can>
        }
      />

      {(createOpen || Boolean(editing)) && (
        <Suspense fallback={null}>
          <ProjectFormDialog
            open
            project={editing}
            onClose={() => {
              setCreateOpen(false);
              setEditing(null);
            }}
            onSuccess={invalidate}
          />
        </Suspense>
      )}
    </RequirePermission>
  );
}
