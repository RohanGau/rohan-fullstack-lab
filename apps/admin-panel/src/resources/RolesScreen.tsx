import { PERMISSIONS, SEEDED_ROLES } from '@fullstack-lab/constants';
import { Button } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useMemo, useState, lazy, Suspense } from 'react';
import { Can, RequirePermission } from '../access/permissions';
import { SECTIONS } from '../access/sections';
import { useAuth } from '../auth/AuthProvider';
import type { ListState } from './listState';
import { isSuperAdmin } from './operators';
import { ResourceList } from './ResourceList';
import { rolesConfig, rolesListSearch, type RoleRow } from './roles';

const RoleFormDialog = lazy(() =>
  import('./RoleFormDialog').then((m) => ({ default: m.RoleFormDialog }))
);

export function RolesScreen() {
  const search = useSearch({ from: SECTIONS.roles.path });
  const navigate = useNavigate({ from: SECTIONS.roles.path });
  const queryClient = useQueryClient();
  const { state: authState } = useAuth();

  const callerIsSuperAdmin = isSuperAdmin(
    authState.status === 'signedIn' ? authState.operator.roles : []
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<RoleRow | null>(null);

  const state = useMemo(() => rolesListSearch.toState(search), [search]);
  const onStateChange = useCallback(
    (next: ListState) => void navigate({ search: rolesListSearch.toSearch(next) }),
    [navigate]
  );

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [rolesConfig.endpoint] });
  }, [queryClient]);

  const editDisabledReason = useCallback(
    (row: RoleRow): string | undefined => {
      if (row.name === SEEDED_ROLES.SUPER_ADMIN) return 'The super_admin Role cannot be changed';
      if (row.isProtected && !callerIsSuperAdmin) {
        return 'Only a Super Admin can change a protected Role';
      }
      return undefined;
    },
    [callerIsSuperAdmin]
  );

  const deleteDisabledReason = useCallback((row: RoleRow): string | undefined => {
    if (row.isProtected) return 'A protected Role cannot be deleted';
    return undefined;
  }, []);

  return (
    <RequirePermission anyOf={SECTIONS.roles.anyOf}>
      <ResourceList
        config={rolesConfig}
        state={state}
        onStateChange={onStateChange}
        onEdit={setEditing}
        editDisabledReason={editDisabledReason}
        deleteDisabledReason={deleteDisabledReason}
        headerActions={
          <Can anyOf={PERMISSIONS.ROLE_MANAGE}>
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              Create role
            </Button>
          </Can>
        }
      />

      {(createOpen || Boolean(editing)) && (
        <Suspense fallback={null}>
          <RoleFormDialog
            open
            role={editing}
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
