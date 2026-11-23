import { API_PATHS, PROTECTED_ROLE_NAMES, SEEDED_ROLES } from '@fullstack-lab/constants';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Typography,
} from '@mui/material';
import { useEffect, useId, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { isSuperAdmin, type Operator } from './operators';

const ALL_ROLES: readonly string[] = [
  SEEDED_ROLES.SUPER_ADMIN,
  SEEDED_ROLES.ADMIN,
  SEEDED_ROLES.CONTENT_MANAGER,
  SEEDED_ROLES.INBOX_MANAGER,
  SEEDED_ROLES.VIEWER,
];

export function AssignRolesDialog({
  operator,
  open,
  onClose,
  onSuccess,
  callerRoles,
}: {
  operator: Operator | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  callerRoles: readonly string[];
}) {
  const { authorizedFetch } = useAuth();
  const titleId = useId();
  const callerIsSuperAdmin = isSuperAdmin(callerRoles);

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (operator) {
      setSelectedRoles([...operator.roles]);
      setServerError(null);
    }
  }, [operator]);

  if (!operator) return null;

  const targetIsSuperAdmin = isSuperAdmin(operator.roles);
  const targetIsBootstrap = Boolean(operator.isBootstrap);

  const handleClose = () => {
    if (busy) return;
    setServerError(null);
    onClose();
  };

  const toggleRole = (role: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles((prev) => [...prev, role]);
    } else {
      setSelectedRoles((prev) => prev.filter((r) => r !== role));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);
    setBusy(true);

    try {
      const response = await authorizedFetch(`${API_PATHS.OPERATORS}/${operator.id}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: selectedRoles }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        return;
      }

      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        msg?: string;
      };
      setServerError(body.message ?? body.msg ?? `Failed to assign roles (${response.status})`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to assign roles');
    } finally {
      setBusy(false);
    }
  };

  const disableAllChanges = targetIsSuperAdmin && !callerIsSuperAdmin;

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby={titleId} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle id={titleId}>Assign Roles: {operator.email}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {serverError && <Alert severity="error">{serverError}</Alert>}

          {disableAllChanges && (
            <Alert severity="info">Only a Super Admin can change a Super Admin&apos;s Roles</Alert>
          )}

          <Box>
            <FormLabel component="legend">Roles</FormLabel>
            <FormGroup sx={{ mt: 1 }}>
              {ALL_ROLES.map((role) => {
                const isProtected = PROTECTED_ROLE_NAMES.includes(role);
                let disabled = busy || disableAllChanges;
                let reason: string | null = null;

                if (targetIsBootstrap && role === SEEDED_ROLES.SUPER_ADMIN) {
                  disabled = true;
                  reason = 'The bootstrap Super Admin cannot lose Super Admin';
                } else if (isProtected && !callerIsSuperAdmin) {
                  disabled = true;
                  reason = 'Only a Super Admin can grant or remove a protected Role';
                } else if (disableAllChanges) {
                  reason = "Only a Super Admin can change a Super Admin's Roles";
                }

                const checked =
                  targetIsBootstrap && role === SEEDED_ROLES.SUPER_ADMIN
                    ? true
                    : selectedRoles.includes(role);

                return (
                  <Box key={role} sx={{ my: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          onChange={(e) => toggleRole(role, e.target.checked)}
                          inputProps={{
                            'aria-label': role,
                          }}
                        />
                      }
                      label={role}
                    />
                    {reason && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', ml: 4 }}
                      >
                        {reason}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={busy || disableAllChanges}>
            Save roles
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
