import { act } from '@testing-library/react';
import { vi } from 'vitest';

type GoogleInitConfig = {
  client_id: string;
  nonce?: string;
  callback: (response: { credential: string }) => void;
};

/**
 * Stands in for Google Identity Services at its browser boundary (window.google).
 * `completeSignIn` plays the Operator finishing Google's own sign-in dialog.
 */
export function installFakeGoogle() {
  let config: GoogleInitConfig | undefined;
  const initialize = vi.fn((next: GoogleInitConfig) => {
    config = next;
  });
  const disableAutoSelect = vi.fn();

  (window as unknown as { google: unknown }).google = {
    accounts: {
      id: {
        initialize,
        disableAutoSelect,
        cancel: vi.fn(),
        renderButton: (element: HTMLElement) => {
          const button = document.createElement('button');
          button.textContent = 'Sign in with Google';
          element.replaceChildren(button);
        },
      },
    },
  };

  return {
    initialize,
    disableAutoSelect,
    get lastConfig() {
      return config;
    },
    async completeSignIn(credential: string) {
      if (!config) throw new Error('Google Identity Services was never initialised');
      await act(async () => config!.callback({ credential }));
    },
  };
}

export function removeFakeGoogle() {
  delete (window as unknown as { google?: unknown }).google;
  document.querySelectorAll('script[src*="accounts.google.com"]').forEach((s) => s.remove());
}
