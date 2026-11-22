const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

export interface GoogleIdentityApi {
  initialize(config: {
    client_id: string;
    nonce: string;
    callback: (response: { credential: string }) => void;
  }): void;
  renderButton(
    element: HTMLElement,
    options: { theme?: string; size?: string; width?: number }
  ): void;
  disableAutoSelect(): void;
  cancel(): void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdentityApi } };
  }
}

export function currentGoogleIdentity(): GoogleIdentityApi | undefined {
  return window.google?.accounts?.id;
}

/** Resolves once Google's sign-in script is available, loading it if needed. */
export function loadGoogleIdentity(): Promise<GoogleIdentityApi> {
  const ready = currentGoogleIdentity();
  if (ready) return Promise.resolve(ready);

  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_SCRIPT_URL}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = GOOGLE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener(
      'load',
      () => {
        const api = currentGoogleIdentity();
        if (api) resolve(api);
        else reject(new Error('Google sign-in loaded but is unavailable'));
      },
      { once: true }
    );
    script.addEventListener(
      'error',
      () => reject(new Error('Google sign-in could not be loaded')),
      {
        once: true,
      }
    );
  });
}
