import Joi from 'joi';

export const generateUploadUrlSchema = Joi.object({
  filename: Joi.string().max(255).required(),
  contentType: Joi.string().max(100).required(),
});

export const r2EnvSchema = Joi.object({
  CLOUDFLARE_R2_ACCOUNT_ID: Joi.string().required(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: Joi.string().required(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: Joi.string().required(),
  CLOUDFLARE_R2_BUCKET_NAME: Joi.string().required(),
  R2_CDN_HOST: Joi.string().optional(),
}).unknown(true);

export const deleteAssetSchema = Joi.object({
  key: Joi.string().min(1).max(1024).required(),
});
