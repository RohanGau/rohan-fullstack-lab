import { API_PATHS, PERMISSIONS, SLOT_STATUS, SLOT_STATUS_VALUES } from '@fullstack-lab/constants';
import type { ISlotDto, Jsonified } from '@fullstack-lab/types';
import { Chip, Stack, Typography } from '@mui/material';
import { createListSearch } from './listSearch';
import type { ResourceConfig } from './ResourceList';

export type SlotRow = Jsonified<ISlotDto>;

const formatDateTime = (value: unknown) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(String(value))
  );

export const slotsConfig: ResourceConfig<SlotRow> = {
  title: 'Slots',
  noun: { singular: 'slot', plural: 'slots' },
  endpoint: API_PATHS.SLOTS,
  columns: [
    { field: 'name', header: 'Name', sortable: true, flex: 1 },
    { field: 'email', header: 'Email', sortable: true, flex: 1.3, minWidth: 180 },
    {
      field: 'date',
      header: 'Scheduled For',
      sortable: true,
      format: formatDateTime,
      minWidth: 170,
    },
    {
      field: 'duration',
      header: 'Duration',
      flex: 0.7,
      minWidth: 100,
      format: (v) => `${String(v)} min`,
    },
    {
      field: 'status',
      header: 'Status',
      flex: 0.8,
      minWidth: 110,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={row.status}
          color={row.status === SLOT_STATUS.BOOKED ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'createdAt',
      header: 'Created',
      sortable: true,
      format: formatDateTime,
      minWidth: 170,
    },
  ],
  filters: [
    { field: 'email', label: 'Email' },
    {
      field: 'status',
      label: 'Status',
      options: SLOT_STATUS_VALUES.map((s) => ({
        value: s,
        label: s[0]!.toUpperCase() + s.slice(1),
      })),
    },
  ],
  defaultSort: { field: 'date', order: 'desc' },
  describeRow: (row) => `slot for ${row.name}`,
  renderDetail: (row) => (
    <Stack spacing={1.5}>
      <Typography color="text.secondary">{row.email}</Typography>
      <Typography>
        Scheduled: {formatDateTime(row.date)} ({row.duration} min)
      </Typography>
      <div>
        <Chip
          size="small"
          label={row.status}
          color={row.status === SLOT_STATUS.BOOKED ? 'success' : 'default'}
        />
      </div>
      {row.message && <Typography sx={{ whiteSpace: 'pre-wrap' }}>{row.message}</Typography>}
    </Stack>
  ),
  editPermission: PERMISSIONS.SLOT_UPDATE,
  deletePermission: PERMISSIONS.SLOT_DELETE,
  actionsWidth: 140,
};

export const slotsListSearch = createListSearch(slotsConfig);
