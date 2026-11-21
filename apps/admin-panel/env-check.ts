export const REQUIRED_ENV = ['VITE_API_URL', 'VITE_GOOGLE_CLIENT_ID'] as const;

/** Throws a clear error naming every missing build-time value. */
export function assertRequiredEnv(env: Record<string, string | undefined>): void {
  const missing = REQUIRED_ENV.filter((key) => !env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `Admin panel build is missing required environment values: ${missing.join(', ')}. ` +
        'Set them in the environment or an .env file (see .env.example).'
    );
  }
  try {
    new URL(env.VITE_API_URL!);
  } catch {
    throw new Error(
      `Admin panel build: VITE_API_URL must be an absolute URL such as https://api.example.com, got "${env.VITE_API_URL}".`
    );
  }
}
