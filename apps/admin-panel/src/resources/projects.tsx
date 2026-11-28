import { API_PATHS, PERMISSIONS } from '@fullstack-lab/constants';
import type { IProjectDto, Jsonified } from '@fullstack-lab/types';
import { Box, Chip, Link, Stack, Typography } from '@mui/material';
import { createListSearch } from './listSearch';
import type { ResourceConfig } from './ResourceList';

export type ProjectRow = Jsonified<IProjectDto>;

export const projectsConfig: ResourceConfig<ProjectRow> = {
  title: 'Projects',
  noun: { singular: 'project', plural: 'projects' },
  endpoint: API_PATHS.PROJECTS,
  columns: [
    { field: 'title', header: 'Title', sortable: true, flex: 1.5, minWidth: 180 },
    { field: 'company', header: 'Company', flex: 1, minWidth: 120 },
    { field: 'year', header: 'Year', sortable: true, flex: 0.6, minWidth: 80 },
    {
      field: 'types',
      header: 'Types',
      flex: 1.1,
      minWidth: 140,
      renderCell: ({ row }) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {(row.types ?? []).map((type) => (
            <Chip key={type} label={type} size="small" />
          ))}
        </div>
      ),
    },
    {
      field: 'techStack',
      header: 'Tech Stack',
      flex: 1.5,
      minWidth: 180,
      renderCell: ({ row }) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {(row.techStack ?? []).slice(0, 3).map((tech) => (
            <Chip key={tech} label={tech} size="small" variant="outlined" />
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
  ],
  filters: [
    { field: 'q', label: 'Search', exactMatch: false },
    { field: 'year', label: 'Year', valueType: 'number' },
    {
      field: 'isFeatured',
      label: 'Featured',
      valueType: 'boolean',
      options: [
        { value: 'true', label: 'Featured' },
        { value: 'false', label: 'Not featured' },
      ],
    },
  ],
  defaultSort: { field: 'year', order: 'desc' },
  describeRow: (row) => `project "${row.title}"`,
  renderDetail: (row) => (
    <Stack spacing={2}>
      <Typography color="text.secondary">
        {[row.company, row.role, row.year].filter(Boolean).join(' · ') || 'Project details'}
      </Typography>
      {row.thumbnailUrl && (
        <Box
          component="img"
          src={row.thumbnailUrl}
          alt={row.title}
          sx={{ maxInlineSize: '100%', maxBlockSize: 220, objectFit: 'cover', borderRadius: 1 }}
        />
      )}
      <Typography sx={{ whiteSpace: 'pre-wrap' }}>{row.description}</Typography>
      {row.features && row.features.length > 0 && (
        <div>
          <Typography variant="subtitle2" gutterBottom>
            Features
          </Typography>
          <ul style={{ margin: 0, paddingInlineStart: '1.25rem' }}>
            {row.features.map((f, idx) => (
              <li key={idx}>
                <Typography variant="body2">{f}</Typography>
              </li>
            ))}
          </ul>
        </div>
      )}
      {row.techStack.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {row.techStack.map((tech) => (
            <Chip key={tech} label={tech} size="small" />
          ))}
        </div>
      )}
      {row.links.length > 0 && (
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">Links</Typography>
          {row.links.map((link, idx) => (
            <Link key={idx} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label || link.url} ({link.kind ?? 'other'})
            </Link>
          ))}
        </Stack>
      )}
    </Stack>
  ),
  editPermission: PERMISSIONS.PROJECT_UPDATE,
  deletePermission: PERMISSIONS.PROJECT_DELETE,
  actionsWidth: 140,
};

export const projectsListSearch = createListSearch(projectsConfig);
