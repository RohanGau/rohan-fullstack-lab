import { API_PATHS, PERMISSIONS } from '@fullstack-lab/constants';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type FormEvent } from 'react';
import { Can, RequirePermission } from '../access/permissions';
import { SECTIONS } from '../access/sections';
import { useAuth } from '../auth/AuthProvider';
import { AssetUploadWidget, type UploadedAsset } from '../components/AssetUploadWidget';
import { parseApiError } from '../lib/apiErrors';
import { ConfirmDialog } from './ConfirmDialog';
import styles from '../routes/Page.module.scss';

export function AssetsScreen() {
  const { authorizedFetch } = useAuth();
  const [recent, setRecent] = useState<UploadedAsset[]>([]);
  const [manualKey, setManualKey] = useState('');
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<{
    kind: 'success' | 'error';
    message: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmKey) return;
    setDeleting(true);
    setDeleteResult(null);
    try {
      const response = await authorizedFetch(API_PATHS.UPLOADS, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: confirmKey }),
      });

      if (response.status === 204 || response.ok) {
        setRecent((prev) => prev.filter((item) => item.key !== confirmKey));
        if (manualKey.trim() === confirmKey) setManualKey('');
        setDeleteResult({ kind: 'success', message: `Deleted ${confirmKey}.` });
        setConfirmKey(null);
        return;
      }

      const parsed = await parseApiError(response, 'Delete failed');
      setDeleteResult({ kind: 'error', message: parsed.message });
      setConfirmKey(null);
    } catch (err) {
      setDeleteResult({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Delete failed',
      });
      setConfirmKey(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleManualDeleteSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = manualKey.trim();
    if (!trimmed) return;
    setConfirmKey(trimmed);
  };

  const copyUrl = async (asset: UploadedAsset) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(asset.cdnUrl).catch(() => {});
      setCopiedKey(asset.key);
    }
  };

  return (
    <RequirePermission anyOf={SECTIONS.assets.anyOf}>
      <section className={styles.page}>
        <Typography variant="h4" component="h1">
          Assets
        </Typography>

        <Can anyOf={PERMISSIONS.UPLOAD_CREATE}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" component="h2">
                  Upload to Cloudflare R2
                </Typography>
                <AssetUploadWidget
                  onUploaded={(asset) => {
                    setRecent((prev) => [asset, ...prev]);
                    setDeleteResult(null);
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Can>

        {deleteResult && (
          <Alert severity={deleteResult.kind} role="status">
            {deleteResult.message}
          </Alert>
        )}

        {recent.length > 0 && (
          <Card>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6" component="h2">
                  Uploaded in this session
                </Typography>
                {recent.map((asset) => (
                  <Box
                    key={asset.key}
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ minInlineSize: 0 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {asset.filename}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Key: {asset.key}
                      </Typography>
                      <Link
                        href={asset.cdnUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="caption"
                      >
                        {asset.cdnUrl}
                      </Link>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => void copyUrl(asset)}>
                        {copiedKey === asset.key ? 'Copied' : 'Copy URL'}
                      </Button>
                      <Can anyOf={PERMISSIONS.UPLOAD_DELETE}>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => setConfirmKey(asset.key)}
                        >
                          Delete
                        </Button>
                      </Can>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        <Can anyOf={PERMISSIONS.UPLOAD_DELETE}>
          <Card>
            <CardContent>
              <form onSubmit={handleManualDeleteSubmit}>
                <Stack spacing={1.5}>
                  <Typography variant="h6" component="h2">
                    Delete asset by key
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Remove any existing object stored in Cloudflare R2 by its key (for example{' '}
                    <code>uploads/2026/02/08/avatar-a1b2c3d4.png</code>).
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Object key"
                      value={manualKey}
                      onChange={(e) => setManualKey(e.target.value)}
                    />
                    <Button
                      type="submit"
                      color="error"
                      variant="outlined"
                      disabled={!manualKey.trim() || deleting}
                    >
                      Delete key
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Can>

        {confirmKey && (
          <ConfirmDialog
            title="Delete this asset?"
            confirmLabel="Delete"
            busy={deleting}
            onCancel={() => setConfirmKey(null)}
            onConfirm={() => void handleDelete()}
          >
            This permanently deletes <strong>{confirmKey}</strong> from Cloudflare R2.
          </ConfirmDialog>
        )}
      </section>
    </RequirePermission>
  );
}
