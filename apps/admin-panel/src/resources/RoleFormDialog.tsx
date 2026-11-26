import { API_PATHS, PERMISSION_VALUES } from '@fullstack-lab/constants';
import { Box, Checkbox, FormControlLabel, FormGroup, TextField, Typography } from '@mui/material';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { FormDialog } from '../components/FormDialog';
import { parseApiError } from '../lib/apiErrors';
import type { RoleRow } from './roles';

const ROLE_NAME_RE = /^[a-z][a-z0-9_]{1,39}$/;

function groupPermissions(): [string, string[]][] {
  const groups = new Map<string, string[]>();
  for (const perm of PERMISSION_VALUES) {
    const [prefix = 'other'] = perm.split(':');
    const existing = groups.get(prefix) ?? [];
    existing.push(perm);
    groups.set(prefix, existing);
  }
  return Array.from(groups.entries());
}

const PERMISSION_GROUPS = groupPermissions();

export function RoleFormDialog({
  open,
  role,
  onClose,
  onSuccess,
}: {
  open: boolean;
  role: RoleRow | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { authorizedFetch } = useAuth();
  const isEditing = Boolean(role);

  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setName(role?.name ?? '');
      setPermissions(role ? [...role.permissions] : []);
      setFieldErrors({});
      setServerError(null);
      setBusy(false);
    }
  }, [open, role]);

  const togglePermission = (perm: string, checked: boolean) => {
    setPermissions((prev) => (checked ? [...prev, perm] : prev.filter((p) => p !== perm)));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setServerError(null);

    const trimmed = name.trim();
    if (!trimmed || !ROLE_NAME_RE.test(trimmed)) {
      setFieldErrors({
        name: 'Must start with a letter and use 2–40 lowercase letters, digits, or underscores.',
      });
      return;
    }

    setBusy(true);
    try {
      const url = role ? `${API_PATHS.ROLES}/${role.id}` : API_PATHS.ROLES;
      const method = role ? 'PUT' : 'POST';
      const body = role?.isProtected ? { permissions } : { name: trimmed, permissions };

      const response = await authorizedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        return;
      }

      const parsed = await parseApiError(response, 'Could not save Role');
      setFieldErrors(parsed.fieldErrors);
      setServerError(parsed.message);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not save Role');
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormDialog
      open={open}
      title={isEditing ? `Edit Role: ${role?.name}` : 'Create Role'}
      submitLabel={isEditing ? 'Save changes' : 'Create role'}
      busy={busy}
      error={serverError}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <TextField
        label="Role name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={Boolean(fieldErrors.name)}
        helperText={
          fieldErrors.name ??
          (role?.isProtected
            ? 'Protected Role names cannot be changed.'
            : 'Lowercase words joined by underscores, e.g. editor_in_chief')
        }
        disabled={busy || Boolean(role?.isProtected)}
        required
        fullWidth
      />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Permissions (from catalogue)
        </Typography>
        {fieldErrors.permissions && (
          <Typography variant="caption" color="error" display="block" gutterBottom>
            {fieldErrors.permissions}
          </Typography>
        )}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: 1.5,
            mt: 1,
          }}
        >
          {PERMISSION_GROUPS.map(([group, perms]) => (
            <Box key={group}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', fontWeight: 700 }}
              >
                {group}
              </Typography>
              <FormGroup>
                {perms.map((perm) => (
                  <FormControlLabel
                    key={perm}
                    control={
                      <Checkbox
                        size="small"
                        checked={permissions.includes(perm)}
                        disabled={busy}
                        onChange={(e) => togglePermission(perm, e.target.checked)}
                      />
                    }
                    label={perm}
                  />
                ))}
              </FormGroup>
            </Box>
          ))}
        </Box>
      </Box>
    </FormDialog>
  );
}
