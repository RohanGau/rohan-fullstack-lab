import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { Box, Button, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';

export interface LinkDraft {
  url: string;
  label?: string;
  kind?: string;
}

/** Shared dynamic links list editor used by Blogs and Projects forms. */
export function LinksEditor({
  links,
  kinds,
  onChange,
  disabled = false,
}: {
  links: LinkDraft[];
  kinds: readonly string[];
  onChange: (next: LinkDraft[]) => void;
  disabled?: boolean;
}) {
  const addRow = () => onChange([...links, { url: '', label: '', kind: 'other' }]);

  const updateRow = (index: number, patch: Partial<LinkDraft>) =>
    onChange(links.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const removeRow = (index: number) => onChange(links.filter((_, i) => i !== index));

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle2">Links</Typography>
        <Button type="button" size="small" variant="outlined" onClick={addRow} disabled={disabled}>
          Add link
        </Button>
      </Stack>

      <Stack spacing={1.5}>
        {links.map((link, index) => (
          <Stack
            key={index}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ sm: 'center' }}
          >
            <TextField
              size="small"
              label="URL"
              type="url"
              value={link.url}
              disabled={disabled}
              onChange={(e) => updateRow(index, { url: e.target.value })}
              sx={{ flex: 2 }}
            />
            <TextField
              size="small"
              label="Label"
              value={link.label ?? ''}
              disabled={disabled}
              onChange={(e) => updateRow(index, { label: e.target.value })}
              sx={{ flex: 1 }}
            />
            <TextField
              select
              size="small"
              label="Kind"
              value={link.kind ?? 'other'}
              disabled={disabled}
              onChange={(e) => updateRow(index, { kind: e.target.value })}
              sx={{ minWidth: 110 }}
            >
              {kinds.map((k) => (
                <MenuItem key={k} value={k}>
                  {k}
                </MenuItem>
              ))}
            </TextField>
            <IconButton
              aria-label={`Remove link ${index + 1}`}
              onClick={() => removeRow(index)}
              disabled={disabled}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
