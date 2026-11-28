export interface ParsedApiError {
  message: string;
  fieldErrors: Record<string, string>;
}

interface ApiErrorPayload {
  message?: string;
  msg?: string;
  error?: string | Array<{ field?: string; message?: string }>;
}

/** Extracts top-level and field-level error messages from any API error response. */
export async function parseApiError(response: Response, fallback: string): Promise<ParsedApiError> {
  const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
  const fieldErrors: Record<string, string> = {};

  if (payload && Array.isArray(payload.error)) {
    for (const item of payload.error) {
      if (item.field && item.message && !fieldErrors[item.field]) {
        fieldErrors[item.field] = item.message;
      }
    }
    const summary = payload.msg ?? payload.message ?? 'Please fix the highlighted fields.';
    return { message: summary, fieldErrors };
  }

  const message =
    payload?.message ??
    (typeof payload?.error === 'string' ? payload.error : undefined) ??
    payload?.msg ??
    `${fallback} (${response.status})`;

  return { message, fieldErrors };
}
