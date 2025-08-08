// src/components/AssetUploadSection.tsx
import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Stack,
  Link as MuiLink,
} from '@mui/material';
import { ALLOWED, MAX_BYTES } from '../utils/Constant';


const isImageUrl = (url?: string | null) =>
  !!url && /\.(png|jpe?g|webp|avif)(\?|$)/i.test(url);

export default function AssetUploadSection({ apiUrl = "" } : { apiUrl: string }) {
  const PRESIGN_URL = `${apiUrl}/api/uploads/generate-upload-url`;
  const DELETE_URL = `${apiUrl}/api/uploads`;
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [progress, setProgress] = React.useState<number | null>(null);

  const [cdnUrl, setCdnUrl] = React.useState<string | null>(null);
  const [assetKey, setAssetKey] = React.useState<string | null>(null);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setCdnUrl(null);
    setAssetKey(null);
    setProgress(null);

    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setFile(null);
      return;
    }

    // Client-side validation (server also validates)
    if (f.size > MAX_BYTES) {
      setError(`File too large. Max ${(MAX_BYTES / (1024 * 1024)).toFixed(0)}MB`);
      setFile(null);
      return;
    }
    if (
      !ALLOWED.includes(f.type as (typeof ALLOWED)[number]) &&
      // allow some browsers that miss type for PDFs
      !(f.name.toLowerCase().endsWith('.pdf') && f.type === '')
    ) {
      setError(`Unsupported type: ${f.type || 'unknown'}`);
      setFile(null);
      return;
    }
    if (!/^[\w\s.\-()]+$/i.test(f.name)) {
      setError('Invalid filename characters. Use letters, numbers, "-", "_", ".", "()".');
      setFile(null);
      return;
    }
    if (f.name.length > 200) {
      setError('Filename too long (max 200 chars).');
      setFile(null);
      return;
    }

    setFile(f);
    // allow reselect of the same file
    e.target.value = '';
  };

  const onUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    setError(null);
    setCdnUrl(null);
    setAssetKey(null);
    setUploading(true);
    setProgress(0);

    try {
      // 1) Presign
      const presign = await fetch(PRESIGN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || guessMime(file.name),
        }),
      });
      if (!presign.ok) {
        const msg = await presign.text();
        throw new Error(`Presign failed: ${presign.status} ${msg}`);
      }
      const { uploadUrl, cdnUrl: _cdnUrl, key } = await presign.json();

      // 2) Upload with progress via XHR
      await putWithProgress(uploadUrl, file, file.type || guessMime(file.name), (pct) =>
        setProgress(pct)
      );

      // 3) Show result (with cache buster)
      const cb = `cb=${Date.now()}`;
      const finalCdn = _cdnUrl.includes('?') ? `${_cdnUrl}&${cb}` : `${_cdnUrl}?${cb}`;
      setCdnUrl(finalCdn);
      setAssetKey(key);
      setFile(null);
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const onDelete = async () => {
    if (!assetKey) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(DELETE_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: assetKey }),
      });
      if (res.status !== 204) {
        const msg = await res.text();
        throw new Error(`Delete failed: ${res.status} ${msg}`);
      }
      setCdnUrl(null);
      setAssetKey(null);
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', p: 2 }}>
      <Card variant="outlined">
        <CardHeader
          title="Asset Uploader"
          subheader="Upload images or PDFs to Cloudflare R2 (presigned URL)"
        />
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Allowed types: {ALLOWED.join(', ')} — Max size:{' '}
              {(MAX_BYTES / (1024 * 1024)).toFixed(0)}MB
            </Typography>

            <Button variant="contained" component="label" disabled={uploading || deleting}>
              Choose File
              <input type="file" hidden accept={ALLOWED.join(',')} onChange={onPickFile} />
            </Button>

            {file && (
              <Typography variant="body2">
                Selected: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)
              </Typography>
            )}

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="contained"
                onClick={onUpload}
                disabled={uploading || deleting || !file}
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setFile(null);
                  setError(null);
                  setCdnUrl(null);
                  setAssetKey(null);
                  setProgress(null);
                }}
                disabled={uploading || deleting}
              >
                Reset
              </Button>

              {/* Delete only when we have an uploaded asset */}
              <Button
                color="error"
                variant="outlined"
                onClick={onDelete}
                disabled={!assetKey || deleting || uploading}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
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

            {cdnUrl && (
              <Stack spacing={1}>
                <Alert severity="success">Upload complete</Alert>
                <Typography variant="body2">
                  CDN URL:{' '}
                  <MuiLink href={cdnUrl} target="_blank" rel="noopener noreferrer">
                    {cdnUrl}
                  </MuiLink>
                </Typography>

                {isImageUrl(cdnUrl) ? (
                  <Box
                    component="img"
                    src={cdnUrl}
                    alt="Uploaded preview"
                    sx={{
                      mt: 1,
                      maxWidth: '100%',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                ) : null}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

function putWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (pct: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });
}

function guessMime(name: string) {
  const n = name.toLowerCase();
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
  if (n.endsWith('.webp')) return 'image/webp';
  if (n.endsWith('.avif')) return 'image/avif';
  if (n.endsWith('.pdf')) return 'application/pdf';
  return 'application/octet-stream';
}