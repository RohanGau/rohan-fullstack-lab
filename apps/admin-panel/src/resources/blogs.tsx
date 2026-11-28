import { API_PATHS, BLOG_STATUS, BLOG_STATUS_VALUES, PERMISSIONS } from '@fullstack-lab/constants';
import type { IBlogDto, Jsonified } from '@fullstack-lab/types';
import { Box, Chip, Link, Stack, Typography } from '@mui/material';
import { createListSearch } from './listSearch';
import type { ResourceConfig } from './ResourceList';

export type BlogRow = Jsonified<IBlogDto>;

const formatDate = (value: unknown) =>
  value
    ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(String(value))
      )
    : '—';

export const blogsConfig: ResourceConfig<BlogRow> = {
  title: 'Blogs',
  noun: { singular: 'blog post', plural: 'blog posts' },
  endpoint: API_PATHS.BLOGS,
  columns: [
    { field: 'title', header: 'Title', sortable: true, flex: 1.6, minWidth: 200 },
    {
      field: 'status',
      header: 'Status',
      flex: 0.9,
      minWidth: 110,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={row.status}
          color={
            row.status === BLOG_STATUS.PUBLISHED
              ? 'success'
              : row.status === BLOG_STATUS.DRAFT
                ? 'warning'
                : 'default'
          }
        />
      ),
    },
    { field: 'author', header: 'Author', flex: 1, minWidth: 130 },
    {
      field: 'tags',
      header: 'Tags',
      flex: 1.4,
      minWidth: 170,
      renderCell: ({ row }) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {(row.tags ?? []).map((tag) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </div>
      ),
    },
    {
      field: 'isFeatured',
      header: 'Featured',
      flex: 0.7,
      minWidth: 100,
      renderCell: ({ row }) =>
        row.isFeatured ? <Chip size="small" label="Featured" color="primary" /> : <span>—</span>,
    },
    {
      field: 'publishedAt',
      header: 'Published',
      sortable: true,
      format: formatDate,
      minWidth: 160,
    },
    {
      field: 'createdAt',
      header: 'Created',
      sortable: true,
      format: formatDate,
      minWidth: 160,
    },
  ],
  filters: [
    { field: 'q', label: 'Search', exactMatch: false },
    {
      field: 'status',
      label: 'Status',
      options: BLOG_STATUS_VALUES.map((s) => ({
        value: s,
        label: s[0]!.toUpperCase() + s.slice(1),
      })),
    },
    {
      field: 'isFeatured',
      label: 'Featured',
      valueType: 'boolean',
      options: [
        { value: 'true', label: 'Featured' },
        { value: 'false', label: 'Not featured' },
      ],
    },
    { field: 'author', label: 'Author', exactMatch: false },
  ],
  defaultSort: { field: 'createdAt', order: 'desc' },
  describeRow: (row) => `blog "${row.title}"`,
  renderDetail: (row) => (
    <Stack spacing={2}>
      <Typography color="text.secondary">
        By {row.author} · Slug: <code>{row.slug}</code> · Status: {row.status}
        {row.readingTime ? ` · ${row.readingTime} min read` : ''}
      </Typography>
      {row.coverImageUrl && (
        <Box
          component="img"
          src={row.coverImageUrl}
          alt={row.title}
          sx={{ maxInlineSize: '100%', maxBlockSize: 220, objectFit: 'cover', borderRadius: 1 }}
        />
      )}
      {row.summary && <Typography variant="subtitle2">{row.summary}</Typography>}
      <Typography sx={{ whiteSpace: 'pre-wrap' }}>{row.content}</Typography>
      {row.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {row.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </div>
      )}
      {row.links.length > 0 && (
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Links</Typography>
          {row.links.map((link, i) => (
            <Link key={i} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label || link.url} ({link.kind ?? 'other'})
            </Link>
          ))}
        </Stack>
      )}
    </Stack>
  ),
  editPermission: PERMISSIONS.BLOG_UPDATE,
  deletePermission: PERMISSIONS.BLOG_DELETE,
  actionsWidth: 140,
};

export const blogsListSearch = createListSearch(blogsConfig);
