import { API_PATHS, PERMISSIONS } from '@fullstack-lab/constants';
import ManageAccountsIcon from '@mui/icons-material/ManageAccountsOutlined';
import PersonOffIcon from '@mui/icons-material/PersonOffOutlined';
import { Button } from '@mui/material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { useCan } from '../access/permissions';
import { RequirePermission } from '../access/permissions';
import { SECTIONS } from '../access/sections';
import { useAuth } from '../auth/AuthProvider';
import { useNotice } from '../shell/notice';
import { AssignRolesDialog } from './AssignRolesDialog';
import { ConfirmDialog } from './ConfirmDialog';
import type { ListState } from './listState';
import { isSuperAdmin, operatorsConfig, operatorsListSearch, type Operator } from './operators';
import { PreRegisterOperatorDialog } from './PreRegisterOperatorDialog';
import { ResourceList } from './ResourceList';

export function OperatorsScreen() {
  const search = useSearch({ from: SECTIONS.operators.path });
  const navigate = useNavigate({ from: SECTIONS.operators.path });
  const queryClient = useQueryClient();
  const { state: authState, authorizedFetch } = useAuth();
  const { showNotice } = useNotice();
  const can = useCan();

  const callerRoles = useMemo(
    () => (authState.status === 'signedIn' ? authState.operator.roles : []),
    [authState]
  );
  const callerIsSuperAdmin = isSuperAdmin(callerRoles);

  const canCreate = can(PERMISSIONS.OPERATOR_CREATE);
  const canAssign = can(PERMISSIONS.OPERATOR_ASSIGN_ROLE);
  const canDeactivate = can(PERMISSIONS.OPERATOR_DEACTIVATE);

  const [preRegisterOpen, setPreRegisterOpen] = useState(false);
  const [assigningRolesTo, setAssigningRolesTo] = useState<Operator | null>(null);
  const [deactivating, setDeactivating] = useState<Operator | null>(null);
  const [deactivatingBusy, setDeactivatingBusy] = useState(false);

  const state = useMemo(() => operatorsListSearch.toState(search), [search]);
  const onStateChange = useCallback(
    (next: ListState) => void navigate({ search: operatorsListSearch.toSearch(next) }),
    [navigate]
  );

  const invalidateOperators = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [operatorsConfig.endpoint] });
  }, [queryClient]);

  const handleDeactivate = async () => {
    if (!deactivating) return;
    setDeactivatingBusy(true);
    try {
      const response = await authorizedFetch(
        `${API_PATHS.OPERATORS}/${deactivating.id}/deactivate`,
        { method: 'POST' }
      );
      if (response.ok) {
        invalidateOperators();
        setDeactivating(null);
      } else {
        const body = (await response.json().catch(() => ({}))) as { message?: string };
        showNotice(body.message ?? `Deactivation failed (${response.status})`);
        setDeactivating(null);
      }
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'Deactivation failed');
      setDeactivating(null);
    } finally {
      setDeactivatingBusy(false);
    }
  };

  const customActions = useCallback(
    (row: Operator) => {
      const targetIsSuperAdmin = isSuperAdmin(row.roles);
      const targetIsBootstrap = Boolean(row.isBootstrap);

      // Assign Roles action checks
      let assignDisabled = false;
      let assignReason = `Assign roles to ${row.email}`;
      if (targetIsSuperAdmin && !callerIsSuperAdmin) {
        assignDisabled = true;
        assignReason = "Only a Super Admin can change a Super Admin's Roles";
      }

      // Deactivate action checks
      let deactivateDisabled = false;
      let deactivateReason = `Deactivate ${row.email}`;
      if (targetIsBootstrap) {
        deactivateDisabled = true;
        deactivateReason = 'The bootstrap Super Admin cannot be deactivated';
      } else if (targetIsSuperAdmin && !callerIsSuperAdmin) {
        deactivateDisabled = true;
        deactivateReason = 'Only a Super Admin can deactivate a Super Admin';
      } else if (!row.active) {
        deactivateDisabled = true;
        deactivateReason = 'Operator is already deactivated';
      }

      return [
        ...(canAssign
          ? [
              <GridActionsCellItem
                key="assign-roles"
                icon={<ManageAccountsIcon />}
                label={`Assign roles to ${row.email}`}
                title={assignReason}
                disabled={assignDisabled}
                onClick={() => setAssigningRolesTo(row)}
              />,
            ]
          : []),
        ...(canDeactivate
          ? [
              <GridActionsCellItem
                key="deactivate"
                icon={<PersonOffIcon />}
                label={`Deactivate ${row.email}`}
                title={deactivateReason}
                disabled={deactivateDisabled}
                onClick={() => setDeactivating(row)}
              />,
            ]
          : []),
      ];
    },
    [canAssign, canDeactivate, callerIsSuperAdmin]
  );

  return (
    <RequirePermission anyOf={SECTIONS.operators.anyOf}>
      <ResourceList
        config={operatorsConfig}
        state={state}
        onStateChange={onStateChange}
        customActions={customActions}
        headerActions={
          canCreate ? (
            <Button variant="contained" onClick={() => setPreRegisterOpen(true)}>
              Pre-register operator
            </Button>
          ) : undefined
        }
      />

      <PreRegisterOperatorDialog
        open={preRegisterOpen}
        onClose={() => setPreRegisterOpen(false)}
        onSuccess={invalidateOperators}
        callerRoles={callerRoles}
      />

      <AssignRolesDialog
        operator={assigningRolesTo}
        open={Boolean(assigningRolesTo)}
        onClose={() => setAssigningRolesTo(null)}
        onSuccess={invalidateOperators}
        callerRoles={callerRoles}
      />

      {deactivating && (
        <ConfirmDialog
          title={`Deactivate ${deactivating.email}?`}
          confirmLabel="Deactivate"
          busy={deactivatingBusy}
          onCancel={() => setDeactivating(null)}
          onConfirm={handleDeactivate}
        >
          Are you sure you want to deactivate {deactivating.email}? Their access will end
          immediately.
        </ConfirmDialog>
      )}
    </RequirePermission>
  );
}
