
import { Request, Response } from 'express';
import { PutObjectCommand , HeadObjectCommand, DeleteObjectCommand} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3, BUCKET, ALLOWED_MIME, buildObjectKey, toCdnUrl } from "../services/r2"
import { deleteAssetSchema, generateUploadUrlSchema } from '../validation/documents';
import { validateSchema } from '../validation';
import logger from '../utils/logger';

export const validateGenerateUploadUrl = validateSchema(generateUploadUrlSchema);
export const validateDeleteAsset = validateSchema(deleteAssetSchema);

/**
 * POST /api/uploads/generate-upload-url
 * body: { filename: string, contentType: string }
 */
export const generateUploadUrl = async (req: Request, res: Response) => {
  try {
    // req.validatedBody set by validateSchema
    // @ts-ignore
     const { filename, contentType } = (req.validatedBody ?? {}) as {
      filename?: string;
      contentType?: string;
    };
    
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Filename and contentType are required' });
    }

    if (!ALLOWED_MIME.has(contentType)) {
      return res.status(400).json({ error: `Unsupported content type: ${contentType}` });
    }

    const Key = buildObjectKey(filename);

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key,
      ContentType: contentType,
      // Optional headers:
      // CacheControl: 'public, max-age=31536000, immutable',
      // Metadata: { uploadedBy: 'admin-ui' },
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

    return res.status(200).json({
      uploadUrl,
      cdnUrl: toCdnUrl(Key),
      key: Key,
      expiresIn: 300,
    });
  } catch (err: any) {
    logger.error({ err }, 'Failed to generate R2 upload URL');
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
};

export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const { key } = (req.validatedBody ?? {}) as { key?: string };
    if (!key) return res.status(400).json({ error: 'key is required' });

    // (Optional) verify exists first to return 404 for nicer UX
    try {
      await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    } catch {
      return res.status(404).json({ error: 'Asset not found' });
    }

    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));

    // (Optional) if you front R2 with a CDN that caches aggressively, you might purge here.
    // R2 dev domain usually updates immediately.

    return res.status(204).send();
  } catch (err) {
    logger.error({ err }, 'Failed to delete R2 asset');
    return res.status(500).json({ error: 'Failed to delete asset' });
  }
};
