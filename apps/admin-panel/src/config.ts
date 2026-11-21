/** Build-time configuration. Missing values fail the build (see env-check.ts). */
export const config = {
  apiUrl: String(import.meta.env.VITE_API_URL).replace(/\/+$/, ''),
  googleClientId: String(import.meta.env.VITE_GOOGLE_CLIENT_ID),
} as const;
