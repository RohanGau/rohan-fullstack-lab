import { API_PATHS, PERMISSIONS } from '@fullstack-lab/constants';
import type { IProfileDto, Jsonified } from '@fullstack-lab/types';
import { Box, Chip, Link, Stack, Typography } from '@mui/material';
import { createListSearch } from './listSearch';
import type { ResourceConfig } from './ResourceList';

export type ProfileRow = Jsonified<IProfileDto>;

const formatDate = (value: unknown) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(String(value))
  );

export const profilesConfig: ResourceConfig<ProfileRow> = {
  title: 'Profiles',
  noun: { singular: 'profile', plural: 'profiles' },
  endpoint: API_PATHS.PROFILES,
  columns: [
    { field: 'name', header: 'Name', sortable: true, flex: 1.2, minWidth: 160 },
    { field: 'title', header: 'Title', flex: 1.3, minWidth: 160 },
    { field: 'email', header: 'Email', sortable: true, flex: 1.3, minWidth: 180 },
    {
      field: 'yearsOfExperience',
      header: 'Experience',
      sortable: true,
      flex: 0.7,
      minWidth: 100,
      format: (v) => `${String(v)} yrs`,
    },
    {
      field: 'topSkills',
      header: 'Top Skills',
      flex: 1.4,
      minWidth: 180,
      renderCell: ({ row }) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {(row.topSkills ?? []).slice(0, 3).map((skill) => (
            <Chip key={skill} label={skill} size="small" />
          ))}
        </div>
      ),
    },
    {
      field: 'updatedAt',
      header: 'Updated',
      sortable: true,
      format: formatDate,
      minWidth: 160,
    },
  ],
  filters: [
    { field: 'name', label: 'Name' },
    { field: 'email', label: 'Email' },
  ],
  defaultSort: { field: 'updatedAt', order: 'desc' },
  describeRow: (row) => `profile for ${row.name}`,
  renderDetail: (row) => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        {row.avatarUrl && (
          <Box
            component="img"
            src={row.avatarUrl}
            alt={row.name}
            sx={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
          />
        )}
        <div>
          <Typography variant="h6">{row.title}</Typography>
          <Typography color="text.secondary">
            {row.email}
            {row.location ? ` · ${row.location}` : ''} · {row.yearsOfExperience} yrs exp
          </Typography>
        </div>
      </Stack>

      {row.bio && <Typography sx={{ whiteSpace: 'pre-wrap' }}>{row.bio}</Typography>}
      {row.philosophy && (
        <div>
          <Typography variant="subtitle2">Philosophy</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {row.philosophy}
          </Typography>
        </div>
      )}

      {row.skills.length > 0 && (
        <div>
          <Typography variant="subtitle2" gutterBottom>
            Skills
          </Typography>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {row.skills.map((skill, idx) => (
              <Chip
                key={idx}
                label={`${skill.name} (${skill.rating}/10 · ${skill.yearsOfExperience}y)`}
                size="small"
              />
            ))}
          </div>
        </div>
      )}

      {row.architectureAreas && row.architectureAreas.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="subtitle2">Architecture Areas</Typography>
          {row.architectureAreas.map((area, idx) => (
            <div key={idx}>
              <Typography variant="body2" fontWeight={600}>
                {area.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {area.topics.join(', ')}
              </Typography>
            </div>
          ))}
        </Stack>
      )}

      {row.impact && row.impact.length > 0 && (
        <div>
          <Typography variant="subtitle2" gutterBottom>
            Impact
          </Typography>
          <ul style={{ margin: 0, paddingInlineStart: '1.25rem' }}>
            {row.impact.map((item, idx) => (
              <li key={idx}>
                <Typography variant="body2">{item}</Typography>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(row.githubUrl || row.linkedinUrl) && (
        <Stack direction="row" spacing={2}>
          {row.githubUrl && (
            <Link href={row.githubUrl} target="_blank" rel="noopener noreferrer">
              GitHub
            </Link>
          )}
          {row.linkedinUrl && (
            <Link href={row.linkedinUrl} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </Link>
          )}
        </Stack>
      )}
    </Stack>
  ),
  editPermission: PERMISSIONS.PROFILE_UPDATE,
  deletePermission: PERMISSIONS.PROFILE_DELETE,
  actionsWidth: 140,
};

export const profilesListSearch = createListSearch(profilesConfig);
