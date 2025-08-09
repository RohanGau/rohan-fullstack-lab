import * as React from 'react';
import { useRecordContext } from 'react-admin';
import { Chip, Stack } from '@mui/material';

interface ChipsFieldProps {
  source: string;
  label?: string;
}

const ChipsField: React.FC<ChipsFieldProps> = ({ source }) => {
  const record = useRecordContext<any>();
  const values: string[] = (record?.[source] ?? []) as string[];

  if (!values?.length) return null;

  return (
    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
      {values.map((v, idx) => (
        <Chip key={`${source}-${idx}`} label={v} size="small" />
      ))}
    </Stack>
  );
};

export default ChipsField;
