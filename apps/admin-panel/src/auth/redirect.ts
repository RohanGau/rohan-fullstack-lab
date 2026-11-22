/**
 * Only paths inside the panel are valid places to return to after sign-in.
 * Anything that could leave the origin (absolute URLs, protocol-relative `//host`,
 * backslashes, control characters) is dropped, and so is sign-in itself (a loop).
 */
export function safeRedirect(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  if (!value.startsWith('/') || value.startsWith('//')) return undefined;
  if (value.includes('\\') || value.includes('://')) return undefined;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) return undefined;
  const path = value.split(/[?#]/, 1)[0];
  if (path === '/sign-in') return undefined;
  return value;
}
