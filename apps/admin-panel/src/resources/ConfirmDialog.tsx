import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useId, type ReactNode } from 'react';

/** Asks before something that cannot be undone. Used by every resource's delete. */
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  busy = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  return (
    <Dialog open onClose={busy ? undefined : onCancel} aria-labelledby={titleId}>
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">{children}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
