export const ALLOWED_IMAGE_ORIGINS: string[];

export function buildCsp(options?: { isDev?: boolean }): string;

export function getSecurityHeaders(options?: { isDev?: boolean }): Array<{
  key: string;
  value: string;
}>;

export function renderCloudflareHeadersFile(): string;
