import { API_PATHS, PERMISSIONS, SEEDED_ROLES } from '@fullstack-lab/constants';
import type { IRoleDto, Jsonified } from '@fullstack-lab/types';
import { Chip, Stack, Typography } from '@mui/material';
import { createListSearch } from './listSearch';
import type { ResourceConfig } from './ResourceList';

export type RoleRow = Jsonified<IRoleDto>;

const formatDate = (value: unknown) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(String(value))
  );

export const rolesConfig: ResourceConfig<RoleRow> = {
  title: 'Roles',
  noun: { singular: 'role', plural: 'roles' },
  endpoint: API_PATHS.ROLES,
  columns: [
    {
      field: 'name',
      header: 'Role',
      sortable: true,
      flex: 1.2,
      minWidth: 180,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <span>{row.name}</span>
          {row.isProtected && (
            <Chip
              size="small"
              label={row.name === SEEDED_ROLES.SUPER_ADMIN ? 'Locked' : 'Protected'}
              color="primary"
              variant="outlined"
            />
          )}
        </Stack>
      ),
    },
    {
      field: 'permissions',
      header: 'Permissions',
      flex: 2.2,
      minWidth: 260,
      renderCell: ({ row }) =>
        row.name === SEEDED_ROLES.SUPER_ADMIN ? (
          <Typography variant="body2" color="text.secondary">
            Full Permission catalogue (implicit)
          </Typography>
        ) : (
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
            {row.permissions.slice(0, 4).map((p) => (
              <Chip key={p} label={p} size="small" />
            ))}
            {row.permissions.length > 4 && (
              <Typography variant="caption" color="text.secondary">
                +{row.permissions.length - 4} more
              </Typography>
            )}
          </Stack>
        ),
    },
    {
      field: 'createdAt',
      header: 'Created',
      sortable: true,
      format: formatDate,
      minWidth: 160,
    },
  ],
  filters: [{ field: 'name', label: 'Role name' }],
  defaultSort: { field: 'name', order: 'asc' },
  describeRow: (row) => `role ${row.name}`,
  renderDetail: (row) => (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {row.isProtected ? 'Protected Role' : 'Standard Role'}
      </Typography>
      {row.name === SEEDED_ROLES.SUPER_ADMIN ? (
        <Typography>Holds every Permission in the catalogue implicitly.</Typography>
      ) : row.permissions.length === 0 ? (
        <Typography color="text.secondary">No Permissions assigned.</Typography>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {row.permissions.map((perm) => (
            <Chip key={perm} label={perm} size="small" />
          ))}
        </div>
      )}
    </Stack>
  ),
  editPermission: PERMISSIONS.ROLE_MANAGE,
  deletePermission: PERMISSIONS.ROLE_MANAGE,
  actionsWidth: 140,
};

export const rolesListSearch = createListSearch(rolesConfig);
