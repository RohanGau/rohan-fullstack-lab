import {
  API_PATHS,
  BLOG_LINK_KIND_VALUES,
  BLOG_STATUS,
  BLOG_STATUS_VALUES,
} from '@fullstack-lab/constants';
import { Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { AssetUploadWidget } from '../components/AssetUploadWidget';
import { ChipListInput } from '../components/ChipListInput';
import { FormDialog } from '../components/FormDialog';
import { LinksEditor, type LinkDraft } from '../components/LinksEditor';
import { parseApiError } from '../lib/apiErrors';
import type { BlogRow } from './blogs';

export function BlogFormDialog({
  open,
  blog,
  onClose,
  onSuccess,
}: {
  open: boolean;
  blog: BlogRow | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { authorizedFetch } = useAuth();
  const isEditing = Boolean(blog);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [author, setAuthor] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState<LinkDraft[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [status, setStatus] = useState<string>(BLOG_STATUS.DRAFT);
  const [isFeatured, setIsFeatured] = useState(false);
  const [publishedAt, setPublishedAt] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(blog?.title ?? '');
      setSlug(blog?.slug ?? '');
      setAuthor(blog?.author ?? '');
      setSummary(blog?.summary ?? '');
      setContent(blog?.content ?? '');
      setTags(blog?.tags ? [...blog.tags] : []);
      setLinks(blog?.links ? blog.links.map((l) => ({ ...l })) : []);
      setCoverImageUrl(blog?.coverImageUrl ?? '');
      setReadingTime(blog?.readingTime ? String(blog.readingTime) : '');
      setStatus(blog?.status ?? BLOG_STATUS.DRAFT);
      setIsFeatured(Boolean(blog?.isFeatured));
      setPublishedAt(blog?.publishedAt ? String(blog.publishedAt).slice(0, 16) : '');
      setFieldErrors({});
      setServerError(null);
      setBusy(false);
    }
  }, [open, blog]);

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
        author: author.trim(),
        content: content.trim(),
        tags,
        links: cleanLinks,
        status,
        isFeatured,
        ...(slug.trim() ? { slug: slug.trim().toLowerCase() } : {}),
        ...(summary.trim() ? { summary: summary.trim() } : {}),
        ...(coverImageUrl.trim() ? { coverImageUrl: coverImageUrl.trim() } : {}),
        ...(readingTime.trim() ? { readingTime: Number(readingTime) } : {}),
        ...(publishedAt ? { publishedAt: new Date(publishedAt).toISOString() } : {}),
      };

      const url = blog ? `${API_PATHS.BLOGS}/${blog.id}` : API_PATHS.BLOGS;
      const response = await authorizedFetch(url, {
        method: blog ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        return;
      }

      const parsed = await parseApiError(response, 'Could not save blog post');
      setFieldErrors(parsed.fieldErrors);
      setServerError(parsed.message);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not save blog post');
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormDialog
      open={open}
      title={isEditing ? `Edit Blog: ${blog?.title}` : 'Create Blog Post'}
      submitLabel={isEditing ? 'Save changes' : 'Create post'}
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
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          error={Boolean(fieldErrors.slug)}
          helperText={fieldErrors.slug ?? 'Optional; auto-generated from title if empty'}
          disabled={busy}
          fullWidth
        />
        <TextField
          label="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          error={Boolean(fieldErrors.author)}
          helperText={fieldErrors.author}
          disabled={busy}
          required
          fullWidth
        />
      </Stack>

      <TextField
        label="Summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        error={Boolean(fieldErrors.summary)}
        helperText={fieldErrors.summary}
        multiline
        rows={2}
        disabled={busy}
        fullWidth
      />

      <TextField
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={Boolean(fieldErrors.content)}
        helperText={fieldErrors.content}
        multiline
        rows={6}
        disabled={busy}
        required
        fullWidth
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={busy}
          fullWidth
        >
          {BLOG_STATUS_VALUES.map((s) => (
            <MenuItem key={s} value={s}>
              {s[0]!.toUpperCase() + s.slice(1)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Reading Time (min)"
          type="number"
          value={readingTime}
          onChange={(e) => setReadingTime(e.target.value)}
          error={Boolean(fieldErrors.readingTime)}
          helperText={fieldErrors.readingTime}
          slotProps={{ htmlInput: { min: 1, max: 120 } }}
          disabled={busy}
          fullWidth
        />
        <TextField
          label="Published At"
          type="datetime-local"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
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
          label="Cover Image URL"
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          error={Boolean(fieldErrors.coverImageUrl)}
          helperText={fieldErrors.coverImageUrl}
          disabled={busy}
          fullWidth
        />
        <Typography variant="caption" color="text.secondary">
          Or upload a cover image directly to Cloudflare R2:
        </Typography>
        <AssetUploadWidget
          compact
          disabled={busy}
          onUploaded={(asset) => setCoverImageUrl(asset.cdnUrl)}
        />
      </Stack>

      <ChipListInput label="Tags" values={tags} onChange={setTags} lowercase disabled={busy} />

      <LinksEditor
        links={links}
        kinds={BLOG_LINK_KIND_VALUES}
        onChange={setLinks}
        disabled={busy}
      />
    </FormDialog>
  );
}
