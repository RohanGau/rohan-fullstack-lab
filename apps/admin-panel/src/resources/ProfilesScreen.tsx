import { PERMISSIONS } from '@fullstack-lab/constants';
import { Button } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useMemo, useState, lazy, Suspense } from 'react';
import { Can, RequirePermission } from '../access/permissions';
import { SECTIONS } from '../access/sections';
import type { ListState } from './listState';
import { profilesConfig, profilesListSearch, type ProfileRow } from './profiles';
import { ResourceList } from './ResourceList';

const ProfileFormDialog = lazy(() =>
  import('./ProfileFormDialog').then((m) => ({ default: m.ProfileFormDialog }))
);

export function ProfilesScreen() {
  const search = useSearch({ from: SECTIONS.profiles.path });
  const navigate = useNavigate({ from: SECTIONS.profiles.path });
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ProfileRow | null>(null);

  const state = useMemo(() => profilesListSearch.toState(search), [search]);
  const onStateChange = useCallback(
    (next: ListState) => void navigate({ search: profilesListSearch.toSearch(next) }),
    [navigate]
  );

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [profilesConfig.endpoint] });
  }, [queryClient]);

  return (
    <RequirePermission anyOf={SECTIONS.profiles.anyOf}>
      <ResourceList
        config={profilesConfig}
        state={state}
        onStateChange={onStateChange}
        onEdit={setEditing}
        headerActions={
          <Can anyOf={PERMISSIONS.PROFILE_CREATE}>
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              New profile
            </Button>
          </Can>
        }
      />

      {(createOpen || Boolean(editing)) && (
        <Suspense fallback={null}>
          <ProfileFormDialog
            open
            profile={editing}
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
