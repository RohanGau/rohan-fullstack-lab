import { API_PATHS, PERMISSIONS } from '@fullstack-lab/constants';
import type { IContactDto, Jsonified } from '@fullstack-lab/types';
import { Typography } from '@mui/material';
import { createListSearch } from './listSearch';
import type { ResourceConfig } from './ResourceList';

export type Contact = Jsonified<IContactDto>;

const formatDate = (value: unknown) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(String(value))
  );

/** What the Contacts list is, declared once. The list screen and the route both read it. */
export const contactsConfig: ResourceConfig<Contact> = {
  title: 'Contacts',
  noun: { singular: 'message', plural: 'messages' },
  endpoint: API_PATHS.CONTACT,
  columns: [
    { field: 'name', header: 'Sender', sortable: true },
    { field: 'email', header: 'Email', sortable: true, flex: 1.2 },
    { field: 'message', header: 'Message', flex: 2 },
    { field: 'createdAt', header: 'Received', sortable: true, format: formatDate, minWidth: 170 },
  ],
  filters: [
    { field: 'name', label: 'Sender' },
    { field: 'email', label: 'Email' },
  ],
  defaultSort: { field: 'createdAt', order: 'desc' },
  describeRow: (row) => `message from ${row.name}`,
  renderDetail: (row) => (
    <>
      <Typography color="text.secondary">{row.email}</Typography>
      <Typography color="text.secondary">Received {formatDate(row.createdAt)}</Typography>
      <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{row.message}</Typography>
    </>
  ),
  deletePermission: PERMISSIONS.CONTACT_DELETE,
};

/** What the Contacts route accepts from the address. */
export const contactsListSearch = createListSearch(contactsConfig);
