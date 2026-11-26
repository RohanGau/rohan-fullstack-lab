import { createMemoryHistory } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import { App } from '../App';
import { REFRESH_TOKEN_STORAGE_KEY } from '../auth/session';

/** Renders the whole panel, as the browser would open it at `path`. */
export function renderPanelAt(path: string) {
  const history = createMemoryHistory({ initialEntries: [path] });
  return { ...render(<App history={history} />), history };
}

/** Plays an earlier visit: a refresh token is left in this browser's storage. */
export function leaveStoredSession(refreshToken: string) {
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
}
