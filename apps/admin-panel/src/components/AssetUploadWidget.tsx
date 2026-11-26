import { API_PATHS, UPLOAD_ALLOWED_MIME_TYPES, UPLOAD_MAX_BYTES } from '@fullstack-lab/constants';
import type { PresignUploadResponse } from '@fullstack-lab/types';
import { Alert, Box, Button, LinearProgress, Link, Stack, Typography } from '@mui/material';
import { useState, type ChangeEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { parseApiError } from '../lib/apiErrors';

export interface UploadedAsset {
  key: string;
  cdnUrl: string;
  filename: string;
  contentType: string;
}

const IMAGE_RE = /\.(png|jpe?g|webp|avif)(\?|$)/i;
const SAFE_FILENAME_RE = /^[\w\s.\-()]+$/i;

function guessMime(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.avif')) return 'image/avif';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'application/octet-stream';
}

function putWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status} ${xhr.statusText})`));
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });
}

export function validateUploadFile(file: File): string | null {
  if (file.size > UPLOAD_MAX_BYTES) {
    return `File too large. Max ${(UPLOAD_MAX_BYTES / (1024 * 1024)).toFixed(0)} MB.`;
  }
  const allowed = UPLOAD_ALLOWED_MIME_TYPES as readonly string[];
  const isPdfFallback = file.name.toLowerCase().endsWith('.pdf') && file.type === '';
  if (!allowed.includes(file.type) && !isPdfFallback) {
    return `Unsupported file type: ${file.type || 'unknown'}`;
  }
  if (!SAFE_FILENAME_RE.test(file.name)) {
    return 'Invalid filename characters. Use letters, numbers, "-", "_", ".", and "()".';
  }
  if (file.name.length > 200) {
    return 'Filename too long (max 200 characters).';
  }
  return null;
}

/**
 * Reusable R2 presigned asset uploader. Works standalone on the Assets screen or inline
 * inside resource forms (e.g. cover image / thumbnail / avatar upload).
 */
export function AssetUploadWidget({
  onUploaded,
  compact = false,
  disabled = false,
}: {
  onUploaded?: (asset: UploadedAsset) => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  const { authorizedFetch } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lastAsset, setLastAsset] = useState<UploadedAsset | null>(null);

  const handlePick = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const chosen = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!chosen) {
      setFile(null);
      return;
    }
    const validationError = validateUploadFile(chosen);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setFile(chosen);
  };

  const handleUpload = async () => {
    if (!file) return;
    setError(null);
    setUploading(true);
    setProgress(0);
    const contentType = file.type || guessMime(file.name);

    try {
      const presign = await authorizedFetch(`${API_PATHS.UPLOADS}/generate-upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType }),
      });
      if (!presign.ok) {
        const parsed = await parseApiError(presign, 'Could not generate upload URL');
        throw new Error(parsed.message);
      }
      const { uploadUrl, cdnUrl, key } = (await presign.json()) as PresignUploadResponse;
      await putWithProgress(uploadUrl, file, contentType, setProgress);

      const asset: UploadedAsset = { key, cdnUrl, filename: file.name, contentType };
      setLastAsset(asset);
      setFile(null);
      onUploaded?.(asset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  return (
    <Stack spacing={1.5}>
      {!compact && (
        <Typography variant="body2" color="text.secondary">
          Allowed: {UPLOAD_ALLOWED_MIME_TYPES.join(', ')} — Max{' '}
          {(UPLOAD_MAX_BYTES / (1024 * 1024)).toFixed(0)} MB
        </Typography>
      )}

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Button
          variant="outlined"
          component="label"
          size={compact ? 'small' : 'medium'}
          disabled={uploading || disabled}
        >
          Choose file
          <input
            type="file"
            hidden
            accept={UPLOAD_ALLOWED_MIME_TYPES.join(',')}
            onChange={handlePick}
          />
        </Button>

        {file && (
          <Button
            variant="contained"
            size={compact ? 'small' : 'medium'}
            onClick={() => void handleUpload()}
            disabled={uploading || disabled}
          >
            {uploading ? 'Uploading…' : `Upload ${file.name}`}
          </Button>
        )}
      </Stack>

      {uploading && (
        <Box>
          <LinearProgress
            variant={progress === null ? 'indeterminate' : 'determinate'}
            value={progress ?? undefined}
          />
          {progress !== null && (
            <Typography variant="caption" color="text.secondary">
              {progress}%
            </Typography>
          )}
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!compact && lastAsset && (
        <Alert severity="success">
          Uploaded{' '}
          <Link href={lastAsset.cdnUrl} target="_blank" rel="noopener noreferrer">
            {lastAsset.key}
          </Link>
          {IMAGE_RE.test(lastAsset.cdnUrl) && (
            <Box
              component="img"
              src={lastAsset.cdnUrl}
              alt={`Preview of ${lastAsset.filename}`}
              sx={{
                display: 'block',
                mt: 1,
                maxInlineSize: '100%',
                maxBlockSize: 220,
                borderRadius: 1,
              }}
            />
          )}
        </Alert>
      )}
    </Stack>
  );
}
