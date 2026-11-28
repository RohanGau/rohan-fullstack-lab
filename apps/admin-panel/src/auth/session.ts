/**
 * The only thing kept in browser storage is the refresh token (which the API rotates
 * on every use). The access token lives in memory only, so a script that can read
 * storage cannot steal a usable credential. Storage can be unavailable (private
 * windows, blocked site data); then the refresh token is held in memory instead, so
 * the session lasts until the tab closes and can still be ended on the server.
 */
export const REFRESH_TOKEN_STORAGE_KEY = 'admin-panel.refresh-token';

let memoryToken: string | null = null;
/** True only while the latest write to storage failed, so storage cannot be trusted for reads. */
let lastWriteFailed = false;

export function readStoredRefreshToken(): string | null {
  if (lastWriteFailed) return memoryToken;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    return memoryToken;
  }
}

export function storeRefreshToken(token: string): void {
  memoryToken = token;
  try {
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
    lastWriteFailed = false;
  } catch {
    lastWriteFailed = true;
  }
}

export function clearStoredRefreshToken(): void {
  memoryToken = null;
  lastWriteFailed = false;
  try {
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    // Nothing stored that we could clear.
  }
}
