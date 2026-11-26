import { Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

/** Reusable string-array editor rendered as interactive chips. */
export function ChipListInput({
  label,
  values,
  onChange,
  helperText,
  disabled = false,
  lowercase = false,
  suggestions,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  helperText?: string;
  disabled?: boolean;
  lowercase?: boolean;
  suggestions?: readonly string[];
}) {
  const [draft, setDraft] = useState('');

  const addItem = (raw: string) => {
    const formatted = lowercase ? raw.trim().toLowerCase() : raw.trim();
    if (!formatted || values.includes(formatted)) {
      setDraft('');
      return;
    }
    onChange([...values, formatted]);
    setDraft('');
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <TextField
          size="small"
          fullWidth
          label={`Add ${label.toLowerCase()}`}
          value={draft}
          disabled={disabled}
          helperText={helperText}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault();
              addItem(draft);
            }
          }}
        />
        <Button
          type="button"
          variant="outlined"
          disabled={disabled || !draft.trim()}
          onClick={() => addItem(draft)}
        >
          Add
        </Button>
      </Stack>

      {values.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {values.map((item) => (
            <Chip
              key={item}
              label={item}
              size="small"
              onDelete={disabled ? undefined : () => onChange(values.filter((v) => v !== item))}
            />
          ))}
        </Box>
      )}

      {suggestions && suggestions.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {suggestions
            .filter((item) => !values.includes(item))
            .map((item) => (
              <Chip
                key={item}
                label={`+ ${item}`}
                size="small"
                variant="outlined"
                disabled={disabled}
                onClick={() => addItem(item)}
              />
            ))}
        </Box>
      )}
    </Box>
  );
}
