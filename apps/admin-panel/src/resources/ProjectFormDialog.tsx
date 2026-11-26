import { API_PATHS, PROJECT_LINK_KINDS, PROJECT_TYPES } from '@fullstack-lab/constants';
import { Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { AssetUploadWidget } from '../components/AssetUploadWidget';
import { ChipListInput } from '../components/ChipListInput';
import { FormDialog } from '../components/FormDialog';
import { LinksEditor, type LinkDraft } from '../components/LinksEditor';
import { parseApiError } from '../lib/apiErrors';
import type { ProjectRow } from './projects';

export function ProjectFormDialog({
  open,
  project,
  onClose,
  onSuccess,
}: {
  open: boolean;
  project: ProjectRow | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { authorizedFetch } = useAuth();
  const isEditing = Boolean(project);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [year, setYear] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [links, setLinks] = useState<LinkDraft[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(project?.title ?? '');
      setDescription(project?.description ?? '');
      setCompany(project?.company ?? '');
      setRole(project?.role ?? '');
      setYear(project?.year ? String(project.year) : '');
      setThumbnailUrl(project?.thumbnailUrl ?? '');
      setTypes(project?.types ? [...project.types] : []);
      setTechStack(project?.techStack ? [...project.techStack] : []);
      setFeatures(project?.features ? [...project.features] : []);
      setLinks(project?.links ? project.links.map((l) => ({ ...l })) : []);
      setIsFeatured(Boolean(project?.isFeatured));
      setFieldErrors({});
      setServerError(null);
      setBusy(false);
    }
  }, [open, project]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setServerError(null);
    setBusy(true);

    try {
      const cleanLinks = links
        .map((l) => ({
          url: l.url.trim(),
          ...(l.label?.trim() ? { label: l.label.trim() } : {}),
          kind: l.kind || 'other',
        }))
        .filter((l) => l.url);

      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        types,
        techStack,
        features,
        links: cleanLinks,
        isFeatured,
        ...(company.trim() ? { company: company.trim() } : {}),
        ...(role.trim() ? { role: role.trim() } : {}),
        ...(year.trim() ? { year: Number(year) } : {}),
        ...(thumbnailUrl.trim() ? { thumbnailUrl: thumbnailUrl.trim() } : {}),
      };

      const url = project ? `${API_PATHS.PROJECTS}/${project.id}` : API_PATHS.PROJECTS;
      const response = await authorizedFetch(url, {
        method: project ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        return;
      }

      const parsed = await parseApiError(response, 'Could not save project');
      setFieldErrors(parsed.fieldErrors);
      setServerError(parsed.message);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not save project');
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormDialog
      open={open}
      title={isEditing ? `Edit Project: ${project?.title}` : 'Create Project'}
      submitLabel={isEditing ? 'Save changes' : 'Create project'}
      busy={busy}
      error={serverError}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={Boolean(fieldErrors.title)}
        helperText={fieldErrors.title}
        disabled={busy}
        required
        fullWidth
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={Boolean(fieldErrors.description)}
        helperText={fieldErrors.description}
        multiline
        rows={4}
        disabled={busy}
        required
        fullWidth
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          disabled={busy}
          fullWidth
        />
        <TextField
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={busy}
          fullWidth
        />
        <TextField
          label="Year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          error={Boolean(fieldErrors.year)}
          helperText={fieldErrors.year}
          disabled={busy}
          fullWidth
        />
      </Stack>

      <FormControlLabel
        control={
          <Checkbox
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            disabled={busy}
          />
        }
        label="Featured on homepage"
      />

      <Stack spacing={1}>
        <TextField
          label="Thumbnail URL"
          type="url"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          error={Boolean(fieldErrors.thumbnailUrl)}
          helperText={fieldErrors.thumbnailUrl}
          disabled={busy}
          fullWidth
        />
        <Typography variant="caption" color="text.secondary">
          Or upload a thumbnail directly to Cloudflare R2:
        </Typography>
        <AssetUploadWidget
          compact
          disabled={busy}
          onUploaded={(asset) => setThumbnailUrl(asset.cdnUrl)}
        />
      </Stack>

      <ChipListInput
        label="Project Types"
        values={types}
        onChange={setTypes}
        suggestions={PROJECT_TYPES}
        disabled={busy}
      />

      <ChipListInput
        label="Tech Stack"
        values={techStack}
        onChange={setTechStack}
        disabled={busy}
      />

      <ChipListInput label="Features" values={features} onChange={setFeatures} disabled={busy} />

      <LinksEditor links={links} kinds={PROJECT_LINK_KINDS} onChange={setLinks} disabled={busy} />
    </FormDialog>
  );
}
