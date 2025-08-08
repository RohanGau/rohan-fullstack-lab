// src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'development' ? '.env' : `.env.${NODE_ENV}`;

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const schema = Joi.object({
  NODE_ENV: Joi.string().default('development'),
  PORT: Joi.string().optional(),
  CLOUDFLARE_R2_ACCOUNT_ID: Joi.string().required(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: Joi.string().required(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: Joi.string().required(),
  CLOUDFLARE_R2_BUCKET_NAME: Joi.string().required(),
  R2_CDN_HOST: Joi.string().optional(),
}).unknown(true);

const { value, error } = schema.validate(process.env, { abortEarly: false });
if (error) {
  throw new Error(`Env validation failed: ${error.message}`);
}

export const env = {
  nodeEnv: value.NODE_ENV as string,
  port: Number(value.PORT ?? 5050),
  r2: {
    accountId: value.CLOUDFLARE_R2_ACCOUNT_ID as string,
    accessKeyId: value.CLOUDFLARE_R2_ACCESS_KEY_ID as string,
    secretAccessKey: value.CLOUDFLARE_R2_SECRET_ACCESS_KEY as string,
    bucket: value.CLOUDFLARE_R2_BUCKET_NAME as string,
    cdnHost: value.R2_CDN_HOST as string | undefined,
  },
};
