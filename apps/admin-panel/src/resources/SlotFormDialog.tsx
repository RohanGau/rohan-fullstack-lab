import { API_PATHS, SLOT_STATUS_VALUES } from '@fullstack-lab/constants';
import { MenuItem, TextField } from '@mui/material';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { FormDialog } from '../components/FormDialog';
import { parseApiError } from '../lib/apiErrors';
import type { SlotRow } from './slots';

function toDateTimeLocal(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function SlotFormDialog({
  slot,
  onClose,
  onSuccess,
}: {
  slot: SlotRow | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { authorizedFetch } = useAuth();
  const [dateLocal, setDateLocal] = useState('');
  const [duration, setDuration] = useState('30');
  const [status, setStatus] = useState('booked');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (slot) {
      setDateLocal(toDateTimeLocal(slot.date));
      setDuration(String(slot.duration));
      setStatus(slot.status);
      setMessage(slot.message ?? '');
      setFieldErrors({});
      setServerError(null);
      setBusy(false);
    }
  }, [slot]);

  if (!slot) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setServerError(null);
    setBusy(true);

    try {
      const isoDate = dateLocal ? new Date(dateLocal).toISOString() : slot.date;
      const response = await authorizedFetch(`${API_PATHS.SLOTS}/${slot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: isoDate,
          duration: Number(duration),
          status,
          message: message.trim(),
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        return;
      }

      const parsed = await parseApiError(response, 'Could not update slot');
      setFieldErrors(parsed.fieldErrors);
      setServerError(parsed.message);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not update slot');
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormDialog
      open
      title={`Edit Slot: ${slot.name}`}
      submitLabel="Save slot"
      busy={busy}
      error={serverError}
      onClose={onClose}
      onSubmit={handleSubmit}
      maxWidth="sm"
    >
      <TextField label="Name" value={slot.name} disabled fullWidth />
      <TextField label="Email" value={slot.email} disabled fullWidth />
      <TextField
        label="Slot Date"
        type="datetime-local"
        value={dateLocal}
        onChange={(e) => setDateLocal(e.target.value)}
        error={Boolean(fieldErrors.date)}
        helperText={fieldErrors.date}
        slotProps={{ inputLabel: { shrink: true } }}
        disabled={busy}
        required
        fullWidth
      />
      <TextField
        label="Duration (minutes)"
        type="number"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        error={Boolean(fieldErrors.duration)}
        helperText={fieldErrors.duration ?? 'Between 15 and 120 minutes'}
        slotProps={{ htmlInput: { min: 15, max: 120 } }}
        disabled={busy}
        required
        fullWidth
      />
      <TextField
        select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        error={Boolean(fieldErrors.status)}
        helperText={fieldErrors.status}
        disabled={busy}
        fullWidth
      >
        {SLOT_STATUS_VALUES.map((s) => (
          <MenuItem key={s} value={s}>
            {s[0]!.toUpperCase() + s.slice(1)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        error={Boolean(fieldErrors.message)}
        helperText={fieldErrors.message}
        multiline
        rows={3}
        disabled={busy}
        fullWidth
      />
    </FormDialog>
  );
}
