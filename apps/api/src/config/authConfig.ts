/**
 * Operator sign-in cannot work, or would be insecure, without these values.
 * There is deliberately no fallback between them or to any other variable
 * (in particular not ADMIN_TOKEN): the API refuses to start instead.
 */
export type EnvVars = Record<string, string | undefined>;

export const REQUIRED_AUTH_ENV = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'GOOGLE_CLIENT_ID',
  'SUPER_ADMIN_EMAIL',
] as const;

export function assertAuthConfig(env: EnvVars = process.env): void {
  const missing = REQUIRED_AUTH_ENV.filter((name) => !env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `Missing required Operator sign-in configuration: ${missing.join(', ')}. ` +
        'The API will not start without it (there is no fallback to ADMIN_TOKEN or between secrets).'
    );
  }
}
