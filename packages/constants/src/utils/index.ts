import { PERMISSION_VALUES, type Permission } from '../auth';

const MONGO_ID_REGEX = /^[a-f\d]{24}$/i;

/** All values of a constants object, typed as the union of its literal values. */
export function valuesOf<T extends Readonly<Record<string, string | number>>>(
  constants: T
): readonly T[keyof T][] {
  return Object.freeze(Object.values(constants)) as readonly T[keyof T][];
}

/** Type guard: is `candidate` one of the allowed `values`? */
export function isOneOf<const V extends readonly (string | number)[]>(
  values: V,
  candidate: unknown
): candidate is V[number] {
  return (values as readonly unknown[]).includes(candidate);
}

/** Type guard: is `value` a Permission in the catalogue? */
export function isPermission(value: unknown): value is Permission {
  return isOneOf(PERMISSION_VALUES, value);
}

/** Does the granted set include `required`? */
export function hasPermission(granted: readonly string[], required: Permission): boolean {
  return granted.includes(required);
}

/** Does the granted set include every one of `required`? */
export function hasAllPermissions(
  granted: readonly string[],
  required: readonly Permission[]
): boolean {
  return required.every((permission) => granted.includes(permission));
}

/** Does the granted set include at least one of `required`? */
export function hasAnyPermission(
  granted: readonly string[],
  required: readonly Permission[]
): boolean {
  return required.some((permission) => granted.includes(permission));
}

/** Check whether a string is a 24-character hexadecimal Mongo ObjectId. */
export function isMongoId(value: string): boolean {
  return MONGO_ID_REGEX.test(value);
}

/** Strip Markdown syntax into plain text suitable for meta descriptions, RSS, and AI indexes. */
export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[[^\]]+]\(([^)]+)\)/g, '$1')
    .replace(/[#>*_~-]+/g, '')
    .replace(/\n{2,}/g, ' ')
    .trim();
}

/** Truncate a string to `max` characters, appending an ellipsis if shortened. */
export function truncate(text: string, max = 180): string {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

/** Serialize a string list as a comma-separated string. */
export function arrToCsv(values?: readonly string[]): string {
  return values && values.length ? values.join(',') : '';
}

/** Parse a comma-separated string into trimmed non-empty entries. */
export function csvToArr(value?: string | null): string[] {
  return value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

/** Extract a human-readable message from an unknown error object. */
export function getErrorMessage(err: unknown, fallback = 'Request failed'): string {
  if (err instanceof Error) return err.message;
  if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message?: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message;
  }
  if (
    typeof err === 'object' &&
    err !== null &&
    'msg' in err &&
    typeof (err as { msg?: unknown }).msg === 'string'
  ) {
    return (err as { msg: string }).msg;
  }
  return fallback;
}

/** Check whether an error represents an aborted fetch/request. */
export function isAbortError(err: unknown): boolean {
  return (
    (err instanceof Error && err.name === 'AbortError') ||
    (typeof err === 'object' &&
      err !== null &&
      'name' in err &&
      (err as { name?: unknown }).name === 'AbortError')
  );
}

/** Parse field-level and global validation messages from an API error payload. */
export function extractApiErrors(err: unknown): {
  fieldErrors: Record<string, string>;
  global: string;
} {
  const fieldErrors: Record<string, string> = {};
  const errObj = typeof err === 'object' && err !== null ? (err as Record<string, any>) : {};
  const data = errObj?.response?.data ?? errObj;
  const arr = data?.error || data?.errors;
  if (Array.isArray(arr)) {
    for (const item of arr) {
      if (item?.field && item?.message) {
        fieldErrors[String(item.field)] = String(item.message);
      }
    }
  }
  const global =
    (typeof data?.msg === 'string' && data.msg) ||
    (typeof data?.message === 'string' && data.message) ||
    (typeof errObj?.message === 'string' && errObj.message) ||
    'Something went wrong';
  return { fieldErrors, global };
}

/** Pick the highest-priority external link (live -> repo -> first available) from a resource. */
export function pickPrimaryLink<T extends { kind?: string; url?: string }>(
  links?: readonly T[] | null
): T | null {
  if (!links?.length) return null;
  const byKind = (kind: string) => links.find((link) => link.kind === kind && link.url);
  return byKind('live') || byKind('repo') || links[0] || null;
}
