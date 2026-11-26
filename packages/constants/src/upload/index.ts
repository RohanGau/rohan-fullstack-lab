export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024; // 10MB

export const UPLOAD_ALLOWED_MIME_TYPES = Object.freeze([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'application/pdf',
] as const);

export type UploadAllowedMimeType = (typeof UPLOAD_ALLOWED_MIME_TYPES)[number];
