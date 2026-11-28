import { API_PATHS } from '@fullstack-lab/constants';
import type { ArchitectureArea, Skills } from '@fullstack-lab/types';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { AssetUploadWidget } from '../components/AssetUploadWidget';
import { ChipListInput } from '../components/ChipListInput';
import { FormDialog } from '../components/FormDialog';
import { parseApiError } from '../lib/apiErrors';
import type { ProfileRow } from './profiles';

type SkillDraft = { name: string; rating: string; yearsOfExperience: string };
type AreaDraft = { _id?: string; title: string; topics: string[] };

export function ProfileFormDialog({
  open,
  profile,
  onClose,
  onSuccess,
}: {
  open: boolean;
  profile: ProfileRow | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { authorizedFetch } = useAuth();
  const isEditing = Boolean(profile);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('0');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [philosophy, setPhilosophy] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [skills, setSkills] = useState<SkillDraft[]>([]);
  const [topSkills, setTopSkills] = useState<string[]>([]);
  const [allTechStack, setAllTechStack] = useState<string[]>([]);
  const [impact, setImpact] = useState<string[]>([]);
  const [architectureAreas, setArchitectureAreas] = useState<AreaDraft[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setName(profile?.name ?? '');
      setEmail(profile?.email ?? '');
      setTitle(profile?.title ?? '');
      setYearsOfExperience(
        profile?.yearsOfExperience !== undefined ? String(profile.yearsOfExperience) : '0'
      );
      setLocation(profile?.location ?? '');
      setBio(profile?.bio ?? '');
      setPhilosophy(profile?.philosophy ?? '');
      setAvatarUrl(profile?.avatarUrl ?? '');
      setGithubUrl(profile?.githubUrl ?? '');
      setLinkedinUrl(profile?.linkedinUrl ?? '');
      setSkills(
        profile?.skills?.map((s) => ({
          name: s.name,
          rating: String(s.rating),
          yearsOfExperience: String(s.yearsOfExperience),
        })) ?? [{ name: '', rating: '8', yearsOfExperience: '1' }]
      );
      setTopSkills(profile?.topSkills ? [...profile.topSkills] : []);
      setAllTechStack(profile?.allTechStack ? [...profile.allTechStack] : []);
      setImpact(profile?.impact ? [...profile.impact] : []);
      setArchitectureAreas(
        profile?.architectureAreas?.map((a) => ({
          ...(a as ArchitectureArea & { _id?: string }),
          topics: [...a.topics],
        })) ?? []
      );
      setFieldErrors({});
      setServerError(null);
      setBusy(false);
    }
  }, [open, profile]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    setServerError(null);
    setBusy(true);

    try {
      const normalizedSkills: Skills[] = skills
        .filter((s) => s.name.trim())
        .map((s) => ({
          name: s.name.trim(),
          rating: Number(s.rating) || 1,
          yearsOfExperience: Number(s.yearsOfExperience) || 0,
        }));

      const normalizedAreas: (ArchitectureArea & { _id?: string })[] = architectureAreas
        .filter((a) => a.title.trim())
        .map((a) => ({
          ...(a._id ? { _id: a._id } : {}),
          title: a.title.trim(),
          topics: a.topics,
        }));

      const payload: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim(),
        title: title.trim(),
        yearsOfExperience: Number(yearsOfExperience) || 0,
        skills: normalizedSkills,
        topSkills,
        allTechStack,
        impact,
        architectureAreas: normalizedAreas,
        ...(location.trim() ? { location: location.trim() } : {}),
        ...(bio.trim() ? { bio: bio.trim() } : {}),
        ...(philosophy.trim() ? { philosophy: philosophy.trim() } : {}),
        ...(avatarUrl.trim() ? { avatarUrl: avatarUrl.trim() } : {}),
        ...(githubUrl.trim() ? { githubUrl: githubUrl.trim() } : {}),
        ...(linkedinUrl.trim() ? { linkedinUrl: linkedinUrl.trim() } : {}),
      };

      const url = profile ? `${API_PATHS.PROFILES}/${profile.id}` : API_PATHS.PROFILES;
      const response = await authorizedFetch(url, {
        method: profile ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        return;
      }

      const parsed = await parseApiError(response, 'Could not save profile');
      setFieldErrors(parsed.fieldErrors);
      setServerError(parsed.message);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormDialog
      open={open}
      title={isEditing ? `Edit Profile: ${profile?.name}` : 'Create Profile'}
      submitLabel={isEditing ? 'Save changes' : 'Create profile'}
      busy={busy}
      error={serverError}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={Boolean(fieldErrors.name)}
          helperText={fieldErrors.name}
          disabled={busy}
          required
          fullWidth
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email}
          disabled={busy}
          required
          fullWidth
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
          label="Years of Experience"
          type="number"
          value={yearsOfExperience}
          onChange={(e) => setYearsOfExperience(e.target.value)}
          error={Boolean(fieldErrors.yearsOfExperience)}
          helperText={fieldErrors.yearsOfExperience}
          slotProps={{ htmlInput: { min: 0 } }}
          disabled={busy}
          required
          sx={{ minWidth: 160 }}
        />
        <TextField
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={busy}
          fullWidth
        />
      </Stack>

      <TextField
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        multiline
        rows={3}
        disabled={busy}
        fullWidth
      />

      <TextField
        label="Philosophy"
        value={philosophy}
        onChange={(e) => setPhilosophy(e.target.value)}
        multiline
        rows={2}
        disabled={busy}
        fullWidth
      />

      <Stack spacing={1}>
        <TextField
          label="Avatar URL"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          error={Boolean(fieldErrors.avatarUrl)}
          helperText={fieldErrors.avatarUrl}
          disabled={busy}
          fullWidth
        />
        <AssetUploadWidget
          compact
          disabled={busy}
          onUploaded={(asset) => setAvatarUrl(asset.cdnUrl)}
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="GitHub URL"
          type="url"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          error={Boolean(fieldErrors.githubUrl)}
          helperText={fieldErrors.githubUrl}
          disabled={busy}
          fullWidth
        />
        <TextField
          label="LinkedIn URL"
          type="url"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          error={Boolean(fieldErrors.linkedinUrl)}
          helperText={fieldErrors.linkedinUrl}
          disabled={busy}
          fullWidth
        />
      </Stack>

      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2">Skills</Typography>
          <Button
            type="button"
            size="small"
            variant="outlined"
            disabled={busy}
            onClick={() =>
              setSkills((prev) => [...prev, { name: '', rating: '8', yearsOfExperience: '1' }])
            }
          >
            Add skill
          </Button>
        </Stack>
        <Stack spacing={1}>
          {skills.map((skill, idx) => (
            <Stack
              key={idx}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ sm: 'center' }}
            >
              <TextField
                size="small"
                label="Skill Name"
                value={skill.name}
                disabled={busy}
                onChange={(e) =>
                  setSkills(skills.map((s, i) => (i === idx ? { ...s, name: e.target.value } : s)))
                }
                sx={{ flex: 2 }}
              />
              <TextField
                size="small"
                label="Rating (1-10)"
                type="number"
                slotProps={{ htmlInput: { min: 1, max: 10 } }}
                value={skill.rating}
                disabled={busy}
                onChange={(e) =>
                  setSkills(
                    skills.map((s, i) => (i === idx ? { ...s, rating: e.target.value } : s))
                  )
                }
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label="Yrs Exp"
                type="number"
                slotProps={{ htmlInput: { min: 0 } }}
                value={skill.yearsOfExperience}
                disabled={busy}
                onChange={(e) =>
                  setSkills(
                    skills.map((s, i) =>
                      i === idx ? { ...s, yearsOfExperience: e.target.value } : s
                    )
                  )
                }
                sx={{ flex: 1 }}
              />
              <IconButton
                aria-label={`Remove skill ${idx + 1}`}
                size="small"
                disabled={busy}
                onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      </Box>

      <ChipListInput
        label="Top Skills"
        values={topSkills}
        onChange={setTopSkills}
        disabled={busy}
      />

      <ChipListInput
        label="All Tech Stack"
        values={allTechStack}
        onChange={setAllTechStack}
        disabled={busy}
      />

      <ChipListInput
        label="Impact Statements"
        values={impact}
        onChange={setImpact}
        disabled={busy}
      />

      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2">Architecture Areas</Typography>
          <Button
            type="button"
            size="small"
            variant="outlined"
            disabled={busy}
            onClick={() => setArchitectureAreas((prev) => [...prev, { title: '', topics: [] }])}
          >
            Add area
          </Button>
        </Stack>
        <Stack spacing={2}>
          {architectureAreas.map((area, idx) => (
            <Box
              key={idx}
              sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  label="Area Title"
                  value={area.title}
                  disabled={busy}
                  onChange={(e) =>
                    setArchitectureAreas(
                      architectureAreas.map((a, i) =>
                        i === idx ? { ...a, title: e.target.value } : a
                      )
                    )
                  }
                />
                <IconButton
                  aria-label={`Remove area ${idx + 1}`}
                  size="small"
                  disabled={busy}
                  onClick={() =>
                    setArchitectureAreas(architectureAreas.filter((_, i) => i !== idx))
                  }
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
              <ChipListInput
                label="Topics"
                values={area.topics}
                disabled={busy}
                onChange={(topics) =>
                  setArchitectureAreas(
                    architectureAreas.map((a, i) => (i === idx ? { ...a, topics } : a))
                  )
                }
              />
            </Box>
          ))}
        </Stack>
      </Box>
    </FormDialog>
  );
}
