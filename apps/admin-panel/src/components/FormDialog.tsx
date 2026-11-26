import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useId, type FormEvent, type ReactNode } from 'react';

/** Standardized modal dialog for resource creation and editing forms. */
export function FormDialog({
  open,
  title,
  submitLabel,
  busy = false,
  error,
  onClose,
  onSubmit,
  children,
  maxWidth = 'md',
}: {
  open: boolean;
  title: string;
  submitLabel: string;
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
}) {
  const titleId = useId();

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      aria-labelledby={titleId}
      maxWidth={maxWidth}
      fullWidth
    >
      <form onSubmit={onSubmit} noValidate>
        <DialogTitle id={titleId}>{title}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {children}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={busy}>
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
