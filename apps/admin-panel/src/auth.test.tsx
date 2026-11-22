import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { REFRESH_TOKEN_STORAGE_KEY } from './auth/session';
import { OPERATOR_EMAIL, fakeAuthApi } from './test/fakeAuthApi';
import { installFakeGoogle } from './test/fakeGoogle';
import { leaveStoredSession, renderPanelAt } from './test/renderPanel';

const REFUSED_MESSAGE =
  'Sign-in was refused. Use the Google account an administrator registered for the Admin panel, then try again.';
const UNREACHABLE_MESSAGE =
  'Could not reach the server, so you are not signed in. Check your connection and try again.';

function storedValues(): string[] {
  return Object.keys(window.localStorage).map((key) => window.localStorage.getItem(key) ?? '');
}

describe('Signing in', () => {
  it('sends a signed-out visitor to sign-in, with Google sign-in and no token or password field', async () => {
    const google = installFakeGoogle();
    fakeAuthApi();

    renderPanelAt('/admin/');

    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/token|password/i)).not.toBeInTheDocument();
    expect(google.lastConfig?.client_id).toBe('test-client-id.apps.googleusercontent.com');
    expect(google.lastConfig?.nonce).toMatch(/^nonce-/);
  });

  it('signs in with a registered Google account and lands on the page they came for', async () => {
    const google = installFakeGoogle();
    const api = fakeAuthApi();
    renderPanelAt('/admin/account');
    await screen.findByRole('button', { name: /sign in with google/i });

    await google.completeSignIn('good-token');

    expect(await screen.findByRole('heading', { name: /^account$/i })).toBeInTheDocument();
    expect(within(screen.getByRole('banner')).getByText(OPERATOR_EMAIL)).toBeInTheDocument();
    expect(within(screen.getByRole('main')).getByText(OPERATOR_EMAIL)).toBeInTheDocument();
    expect(api.calls.signIn[0]?.body).toEqual({
      idToken: 'good-token',
      nonce: google.initialize.mock.calls[0]![0].nonce,
    });
    expect(api.calls.me[0]?.authorization).toMatch(/^Bearer access-\d+$/);
  });

  it('keeps only the refresh token in browser storage, never the access token', async () => {
    const google = installFakeGoogle();
    const api = fakeAuthApi();
    renderPanelAt('/admin/');
    await screen.findByRole('button', { name: /sign in with google/i });

    await google.completeSignIn('good-token');
    await screen.findByText(OPERATOR_EMAIL);

    const stored = storedValues();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatch(/^refresh-/);
    expect(api.calls.me[0]?.authorization).toMatch(/^Bearer access-/);
    expect(JSON.stringify(window.sessionStorage)).not.toMatch(/access-/);
  });

  it('shows a clear message, stores nothing and offers a fresh attempt when sign-in is refused', async () => {
    const google = installFakeGoogle();
    fakeAuthApi();
    renderPanelAt('/admin/');
    await screen.findByRole('button', { name: /sign in with google/i });
    const firstNonce = google.lastConfig?.nonce;

    await google.completeSignIn('unregistered-token');

    expect(await screen.findByRole('alert')).toHaveTextContent(REFUSED_MESSAGE);
    expect(storedValues()).toEqual([]);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    await waitFor(() => expect(google.lastConfig?.nonce).not.toBe(firstNonce));
  });

  it('never ends up signed in when the API cannot be reached during sign-in', async () => {
    const google = installFakeGoogle();
    const api = fakeAuthApi();
    api.failSignInNetwork();
    renderPanelAt('/admin/');
    await screen.findByRole('button', { name: /sign in with google/i });

    await google.completeSignIn('good-token');

    expect(await screen.findByRole('alert')).toHaveTextContent(UNREACHABLE_MESSAGE);
    expect(storedValues()).toEqual([]);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByText(OPERATOR_EMAIL)).not.toBeInTheDocument();
  });

  it('loads Google Identity Services from Google when it is not already on the page', async () => {
    fakeAuthApi();
    renderPanelAt('/admin/');

    await waitFor(() =>
      expect(
        document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      ).not.toBeNull()
    );
    installFakeGoogle();
    act(() => {
      document
        .querySelector('script[src="https://accounts.google.com/gsi/client"]')!
        .dispatchEvent(new Event('load'));
    });

    expect(await screen.findByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });
});

describe('Staying signed in', () => {
  it('restores the session after a reload from the stored refresh token', async () => {
    installFakeGoogle();
    const api = fakeAuthApi();
    leaveStoredSession(api.seedRefreshToken());

    renderPanelAt('/admin/account');

    expect(await screen.findByRole('heading', { name: /^account$/i })).toBeInTheDocument();
    expect(within(screen.getByRole('main')).getByText(OPERATOR_EMAIL)).toBeInTheDocument();
    expect(api.calls.refresh).toHaveLength(1);
    expect(api.calls.signIn).toHaveLength(0);
  });

  it('returns to sign-in and clears storage when the stored session can no longer be refreshed', async () => {
    installFakeGoogle();
    fakeAuthApi(); // no valid refresh token exists on the server
    leaveStoredSession('refresh-revoked');

    renderPanelAt('/admin/');

    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('refreshes once and retries when the API refuses an expired access token', async () => {
    installFakeGoogle();
    const api = fakeAuthApi();
    api.rejectNextMeWith401();
    leaveStoredSession(api.seedRefreshToken());

    renderPanelAt('/admin/account');

    expect(await screen.findByRole('heading', { name: /^account$/i })).toBeInTheDocument();
    // First /me was refused (expired token); the panel refreshed again and asked once more.
    expect(api.calls.me).toHaveLength(2);
    expect(api.calls.refresh).toHaveLength(2); // one on reload, one after the refusal
  });

  describe('with a short-lived access token', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('refreshes silently before the access token expires', async () => {
      installFakeGoogle();
      const api = fakeAuthApi({ accessTtlSeconds: 60 });
      leaveStoredSession(api.seedRefreshToken());
      vi.useFakeTimers({ shouldAdvanceTime: true });
      renderPanelAt('/admin/account');
      await screen.findByRole('heading', { name: /^account$/i });
      expect(api.calls.refresh).toHaveLength(1);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(55_000);
      });

      await waitFor(() => expect(api.calls.refresh).toHaveLength(2));
      expect(screen.getByRole('heading', { name: /^account$/i })).toBeInTheDocument();
    });
  });
});

describe('Deep links', () => {
  it('returns the Operator to the link they opened once they have signed in', async () => {
    const google = installFakeGoogle();
    fakeAuthApi();
    const { history } = renderPanelAt('/admin/account');
    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    await screen.findByRole('button', { name: /sign in with google/i });

    await google.completeSignIn('good-token');

    expect(await screen.findByRole('heading', { name: /^account$/i })).toBeInTheDocument();
    expect(history.location.pathname).toBe('/admin/account'); // still under the /admin base path
  });

  it.each([
    ['an absolute URL', 'https://evil.example/steal'],
    ['a protocol-relative URL', '//evil.example/steal'],
    ['a backslash host', '/\\evil.example'],
    ['a path with a control character', '/\t/evil.example'],
    ['another sign-in redirect', '/sign-in?redirect=/account'],
  ])('ignores a redirect that is %s and lands on the start page', async (_label, redirect) => {
    const google = installFakeGoogle();
    fakeAuthApi();
    const { history } = renderPanelAt(`/admin/sign-in?redirect=${encodeURIComponent(redirect)}`);
    await screen.findByRole('button', { name: /sign in with google/i });

    await google.completeSignIn('good-token');

    expect(await screen.findByRole('heading', { name: /^admin panel$/i })).toBeInTheDocument();
    expect(history.location.pathname).toBe('/admin/');
  });
});

describe('Signing out', () => {
  it('ends the session on the server, clears storage and returns to sign-in', async () => {
    const google = installFakeGoogle();
    const api = fakeAuthApi();
    leaveStoredSession(api.seedRefreshToken());
    renderPanelAt('/admin/account');
    await screen.findByRole('heading', { name: /^account$/i });
    const refreshTokenBeforeSignOut = window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

    await userEvent.click(screen.getByRole('button', { name: /sign out/i }));

    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(api.calls.logout).toHaveLength(1);
    expect(api.calls.logout[0]?.body).toEqual({ refreshToken: refreshTokenBeforeSignOut });
    expect(storedValues()).toEqual([]);
    expect(google.disableAutoSelect).toHaveBeenCalled();
  });

  it('still signs out locally when the API cannot be reached', async () => {
    installFakeGoogle();
    const api = fakeAuthApi();
    api.failLogoutNetwork();
    leaveStoredSession(api.seedRefreshToken());
    renderPanelAt('/admin/account');
    await screen.findByRole('heading', { name: /^account$/i });

    await userEvent.click(screen.getByRole('button', { name: /sign out/i }));

    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(storedValues()).toEqual([]);
  });

  it('shows who is signed in in the header', async () => {
    installFakeGoogle();
    const api = fakeAuthApi();
    leaveStoredSession(api.seedRefreshToken());

    renderPanelAt('/admin/');

    const banner = await screen.findByRole('banner');
    expect(within(banner).getByText(OPERATOR_EMAIL)).toBeInTheDocument();
    expect(within(banner).getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });
});

describe('When things go wrong around the session', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('does not leave a live session behind when the Operator cannot be loaded after sign-in', async () => {
    const google = installFakeGoogle();
    const api = fakeAuthApi();
    api.failMeNetwork();
    renderPanelAt('/admin/');
    await screen.findByRole('button', { name: /sign in with google/i });

    await google.completeSignIn('good-token');

    expect(await screen.findByRole('alert')).toHaveTextContent(UNREACHABLE_MESSAGE);
    expect(storedValues()).toEqual([]);
    await waitFor(() => expect(api.calls.logout).toHaveLength(1)); // the server session was ended too
    expect(api.calls.logout[0]?.body?.refreshToken).toMatch(/^refresh-/);
  });

  it('keeps the session for the tab and still ends it on the server when browser storage is blocked', async () => {
    const google = installFakeGoogle();
    const api = fakeAuthApi();
    renderPanelAt('/admin/');
    await screen.findByRole('button', { name: /sign in with google/i });
    const blocked = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(blocked);

    await google.completeSignIn('good-token');
    expect(await screen.findByRole('heading', { name: /^admin panel$/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /sign out/i }));

    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(api.calls.logout[0]?.body?.refreshToken).toMatch(/^refresh-/);
  });

  it('stays signed in when another tab rotated the refresh token first', async () => {
    installFakeGoogle();
    const api = fakeAuthApi();
    leaveStoredSession(api.seedRefreshToken());
    api.rotateInOtherTabOnNextRefresh();

    renderPanelAt('/admin/account');

    expect(await screen.findByRole('heading', { name: /^account$/i })).toBeInTheDocument();
    expect(api.calls.refresh).toHaveLength(2);
    expect(api.calls.refresh[1]?.body?.refreshToken).toBe('refresh-other-tab');
  });

  describe('while the access token is being refreshed in the background', () => {
    async function openAccountWithShortLivedToken() {
      installFakeGoogle();
      const api = fakeAuthApi({ accessTtlSeconds: 60 });
      leaveStoredSession(api.seedRefreshToken());
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderPanelAt('/admin/account');
      await screen.findByRole('heading', { name: /^account$/i });
      return { api, user };
    }

    it('tries again shortly when the background refresh fails to reach the API', async () => {
      const { api } = await openAccountWithShortLivedToken();
      api.failNextRefreshNetwork();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(48_000); // the scheduled refresh fails
      });
      await waitFor(() => expect(api.calls.refresh).toHaveLength(2));
      expect(screen.getByRole('heading', { name: /^account$/i })).toBeInTheDocument();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(15_000); // and is retried
      });

      await waitFor(() => expect(api.calls.refresh).toHaveLength(3));
      expect(screen.getByRole('heading', { name: /^account$/i })).toBeInTheDocument();
    });

    it('does not bring the session back when the Operator signs out while a refresh is in flight', async () => {
      const { api, user } = await openAccountWithShortLivedToken();
      const release = api.holdNextRefresh();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(48_000);
      });
      await waitFor(() => expect(api.calls.refresh).toHaveLength(2));

      await user.click(screen.getByRole('button', { name: /sign out/i }));
      expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      await act(async () => {
        release();
      });

      await waitFor(() => expect(api.calls.logout).toHaveLength(2)); // the late tokens are revoked too
      expect(storedValues()).toEqual([]);
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });
  });
});
