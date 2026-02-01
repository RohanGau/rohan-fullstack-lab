import { S3Client } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { env } from '../config/env';

export const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.r2.accessKeyId,
    secretAccessKey: env.r2.secretAccessKey,
  },
});

export const BUCKET = env.r2.bucket;

export const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'application/pdf',
]);

export function sanitizeBaseName(name: string) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)
    .toLowerCase();
}

export function buildObjectKey(filename: string) {
  const dot = filename.lastIndexOf('.');
  const ext = dot > -1 ? filename.slice(dot + 1).toLowerCase() : '';
  const base = sanitizeBaseName(dot > -1 ? filename.slice(0, dot) : filename);
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const uid = crypto.randomUUID().split('-')[0];
  const dir = `uploads/${yyyy}/${mm}/${dd}`;
  return `${dir}/${ext ? `${base}-${uid}.${ext}` : `${base}-${uid}`}`;
}

export function toCdnUrl(key: string) {
  const host = env.r2.cdnHost ?? `${env.r2.bucket}.${env.r2.accountId}.r2.dev`;
  return `https://${host}/${key}`;
}
