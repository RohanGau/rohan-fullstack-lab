import { API_PATHS, PROTECTED_ROLE_NAMES } from '@fullstack-lab/constants';
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
  TextField,
  Typography,
} from '@mui/material';
import { useId, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { isSuperAdmin, useAssignableRoles } from './operators';

export function PreRegisterOperatorDialog({
  open,
  onClose,
  onSuccess,
  callerRoles,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  callerRoles: readonly string[];
}) {
  const { authorizedFetch } = useAuth();
  const titleId = useId();
  const callerIsSuperAdmin = isSuperAdmin(callerRoles);
  const availableRoles = useAssignableRoles(open);

  const [email, setEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const resetForm = () => {
    setEmail('');
    setSelectedRoles([]);
    setEmailError(null);
    setServerError(null);
    setBusy(false);
  };

  const handleClose = () => {
    if (busy) return;
    resetForm();
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
    setEmailError(null);
    setServerError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Email is required');
      return;
    }
    if (!trimmed.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setBusy(true);
    try {
      const response = await authorizedFetch(API_PATHS.OPERATORS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, roles: selectedRoles }),
      });

      if (response.status === 201) {
        resetForm();
        onSuccess();
        onClose();
        return;
      }

      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        msg?: string;
      };
      if (response.status === 409) {
        setEmailError(body.message ?? 'An Operator with this email already exists');
      } else {
        setServerError(body.message ?? body.msg ?? `Pre-registration failed (${response.status})`);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Pre-registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby={titleId} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id={titleId}>Pre-register Operator</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {serverError && <Alert severity="error">{serverError}</Alert>}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            error={Boolean(emailError)}
            helperText={emailError}
            required
            fullWidth
            disabled={busy}
            slotProps={{
              htmlInput: {
                'aria-label': 'Operator Email',
              },
            }}
          />

          <Box>
            <FormLabel component="legend">Roles</FormLabel>
            <FormGroup sx={{ mt: 1 }}>
              {availableRoles.map((role) => {
                const isProtected = PROTECTED_ROLE_NAMES.includes(role);
                const disabled = isProtected && !callerIsSuperAdmin;
                const reason = disabled
                  ? 'Only a Super Admin can grant or remove a protected Role'
                  : null;

                return (
                  <Box key={role} sx={{ my: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedRoles.includes(role)}
                          disabled={disabled || busy}
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
          <Button type="submit" variant="contained" disabled={busy}>
            Pre-register
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
