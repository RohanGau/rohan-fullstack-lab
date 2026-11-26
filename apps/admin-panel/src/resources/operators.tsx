import { API_PATHS, PERMISSIONS, SEEDED_ROLES } from '@fullstack-lab/constants';
import type { IOperatorDto, IRoleDto, Jsonified } from '@fullstack-lab/types';
import { Chip, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useCan } from '../access/permissions';
import { useAuth } from '../auth/AuthProvider';
import { createListSearch } from './listSearch';
import type { ResourceConfig } from './ResourceList';

export type Operator = Jsonified<IOperatorDto>;

export const SEEDED_ROLE_LIST: readonly string[] = [
  SEEDED_ROLES.SUPER_ADMIN,
  SEEDED_ROLES.ADMIN,
  SEEDED_ROLES.CONTENT_MANAGER,
  SEEDED_ROLES.INBOX_MANAGER,
  SEEDED_ROLES.VIEWER,
];

/**
 * Fetches all Roles (including custom Roles) when the caller has role:manage,
 * falling back to the seeded role constants otherwise.
 */
export function useAssignableRoles(open: boolean, extraRoles: readonly string[] = []): string[] {
  const { authorizedFetch } = useAuth();
  const canManageRoles = useCan()(PERMISSIONS.ROLE_MANAGE);

  const query = useQuery({
    queryKey: [API_PATHS.ROLES, 'assignable'],
    enabled: open && canManageRoles,
    staleTime: 30_000,
    queryFn: async (): Promise<string[]> => {
      const response = await authorizedFetch(
        `${API_PATHS.ROLES}?range=${encodeURIComponent('[0,99]')}&sort=${encodeURIComponent('["name","ASC"]')}&filter=${encodeURIComponent('{}')}`
      );
      if (!response.ok) return [...SEEDED_ROLE_LIST];
      const rows = (await response.json()) as Jsonified<IRoleDto>[];
      return rows.map((r) => r.name);
    },
  });

  const combined = new Set<string>([...SEEDED_ROLE_LIST, ...(query.data ?? []), ...extraRoles]);
  return Array.from(combined);
}

const formatDate = (value: unknown) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(String(value))
  );

export function isSuperAdmin(roles: readonly string[]): boolean {
  return roles.includes(SEEDED_ROLES.SUPER_ADMIN);
}

/** What the Operators list is, declared once. The list screen and the route both read it. */
export const operatorsConfig: ResourceConfig<Operator> = {
  title: 'Operators',
  noun: { singular: 'operator', plural: 'operators' },
  endpoint: API_PATHS.OPERATORS,
  columns: [
    {
      field: 'email',
      header: 'Email',
      sortable: true,
      flex: 1.5,
      minWidth: 220,
      renderCell: ({ row }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{row.email}</span>
          {row.isBootstrap && (
            <Chip
              size="small"
              label="Bootstrap"
              color="primary"
              variant="outlined"
              title="Bootstrap Super Admin"
            />
          )}
        </div>
      ),
    },
    {
      field: 'roles',
      header: 'Roles',
      flex: 2,
      minWidth: 200,
      renderCell: ({ row }) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {row.roles.map((role) => (
            <Chip key={role} label={role} size="small" />
          ))}
        </div>
      ),
    },
    {
      field: 'active',
      header: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: ({ row }) => (
        <Chip
          label={row.active ? 'Active' : 'Deactivated'}
          color={row.active ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'hasSignedIn',
      header: 'Signed In',
      flex: 0.8,
      minWidth: 100,
      renderCell: ({ row }) => (
        <Typography variant="body2">{row.hasSignedIn ? 'Yes' : 'Not yet'}</Typography>
      ),
    },
    {
      field: 'createdAt',
      header: 'Created',
      sortable: true,
      format: formatDate,
      minWidth: 170,
    },
  ],
  filters: [{ field: 'email', label: 'Email' }],
  defaultSort: { field: 'createdAt', order: 'desc' },
  describeRow: (row) => `operator ${row.email}`,
  actionsWidth: 130,
};

/** What the Operators route accepts from the address. */
export const operatorsListSearch = createListSearch(operatorsConfig);
