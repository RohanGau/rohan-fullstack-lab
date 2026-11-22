import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { REFRESH_TOKEN_STORAGE_KEY } from './auth/session';
import { fakeAuthApi } from './test/fakeAuthApi';
import { installFakeGoogle } from './test/fakeGoogle';
import { leaveStoredSession, renderPanelAt } from './test/renderPanel';
import { EXPECTED_NAVIGATION, ROLE_ACCESS, type SeededRole } from './test/roles';
import { setViewportWidth } from './test/viewport';

const ROLES = Object.keys(ROLE_ACCESS) as SeededRole[];
const FORBIDDEN_MESSAGE =
  'You do not have permission to do that. Ask an administrator for a Role that includes it.';

function openAs(role: SeededRole, path: string, options: { accessTtlSeconds?: number } = {}) {
  installFakeGoogle();
  const api = fakeAuthApi({ ...options, access: ROLE_ACCESS[role] });
  leaveStoredSession(api.seedRefreshToken());
  return { api, ...renderPanelAt(path) };
}

function navigationLinks(): string[] {
  const nav = screen.getByRole('navigation', { name: /main/i });
  return within(nav)
    .getAllByRole('link')
    .map((link) => link.textContent ?? '')
    .sort();
}

describe('Navigation follows the Operator’s Permissions', () => {
  it.each(ROLES)('shows %s exactly the sections their Permissions allow', async (role) => {
    openAs(role, '/admin/');
    await screen.findByRole('navigation', { name: /main/i });

    expect(navigationLinks()).toEqual(EXPECTED_NAVIGATION[role]);
  });

  it('opens a section the Operator may use', async () => {
    openAs('inbox_manager', '/admin/');
    await userEvent.click(await screen.findByRole('link', { name: 'Contacts' }));

    expect(await screen.findByRole('heading', { name: 'Contacts' })).toBeInTheDocument();
  });

  it.each([
    ['viewer', '/admin/blogs'],
    ['content_manager', '/admin/contacts'],
    ['inbox_manager', '/admin/operators'],
    ['viewer', '/admin/roles'],
    ['content_manager', '/admin/slots'],
  ] as const)('tells %s they have no access when they open %s directly', async (role, path) => {
    openAs(role, path);

    expect(
      await screen.findByRole('heading', { name: 'You do not have access to this page' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ask an administrator for a role that includes this access/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument();
  });

  it.each([
    ['/admin/assets', 'Assets'],
    ['/admin/blogs', 'Blogs'],
    ['/admin/contacts', 'Contacts'],
    ['/admin/operators', 'Operators'],
    ['/admin/profiles', 'Profiles'],
    ['/admin/projects', 'Projects'],
    ['/admin/roles', 'Roles'],
    ['/admin/slots', 'Slots'],
  ])('lets a Super Admin open %s', async (path, title) => {
    openAs('super_admin', path);

    expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('lets an Operator with only one of a resource’s Permissions in', async () => {
    installFakeGoogle();
    const api = fakeAuthApi({ access: { roles: ['custom'], permissions: ['blog:delete'] } });
    leaveStoredSession(api.seedRefreshToken());
    renderPanelAt('/admin/blogs');

    expect(await screen.findByRole('heading', { name: 'Blogs' })).toBeInTheDocument();
  });
});

describe('Account', () => {
  it('shows the Operator’s Roles and how many Permissions they hold', async () => {
    openAs('viewer', '/admin/account');

    await screen.findByRole('heading', { name: 'Account' });
    const main = screen.getByRole('main');
    expect(within(main).getByText('viewer')).toBeInTheDocument();
    expect(within(main).getByText('2 permissions')).toBeInTheDocument();
  });

  it('picks up changes to the Operator’s Roles when they reload their access', async () => {
    const { api } = openAs('viewer', '/admin/account');
    await screen.findByRole('link', { name: 'Contacts' });
    api.changeAccess(ROLE_ACCESS.content_manager);

    await userEvent.click(screen.getByRole('button', { name: /reload access/i }));

    expect(await screen.findByRole('status')).toHaveTextContent('Access reloaded.');
    expect(navigationLinks()).toEqual(EXPECTED_NAVIGATION.content_manager);
  });
});

describe('When the API refuses a request', () => {
  it('tells the Operator to ask for a different Role when it answers 403, and keeps them signed in', async () => {
    const { api } = openAs('viewer', '/admin/account');
    await screen.findByRole('button', { name: /reload access/i });
    api.respondToMeWith(403);

    await userEvent.click(screen.getByRole('button', { name: /reload access/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(FORBIDDEN_MESSAGE);
    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument();
  });

  it('shows the 403 message as a notice the Operator can dismiss', async () => {
    const { api } = openAs('viewer', '/admin/account');
    await screen.findByRole('button', { name: /reload access/i });
    api.respondToMeWith(403);
    await userEvent.click(screen.getByRole('button', { name: /reload access/i }));
    const notice = await screen.findByRole('alert');
    expect(notice).toHaveTextContent(FORBIDDEN_MESSAGE);

    await userEvent.click(within(notice).getByRole('button', { name: /close/i }));

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('refreshes once and carries on when the API answers 401', async () => {
    const { api } = openAs('viewer', '/admin/account');
    await screen.findByRole('button', { name: /reload access/i });
    const refreshesBefore = api.calls.refresh.length;
    api.respondToMeWith(401);

    await userEvent.click(screen.getByRole('button', { name: /reload access/i }));

    expect(await screen.findByRole('status')).toHaveTextContent('Access reloaded.');
    expect(api.calls.refresh).toHaveLength(refreshesBefore + 1);
  });

  it('returns to sign-in when the API still answers 401 after a refresh', async () => {
    const { api } = openAs('viewer', '/admin/account');
    await screen.findByRole('button', { name: /reload access/i });
    api.respondToMeWith(401, 2);

    await userEvent.click(screen.getByRole('button', { name: /reload access/i }));

    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)).toBeNull();
  });
});

describe('Reloading access while other things happen', () => {
  it('does not bring the session back when the Operator signs out during a reload', async () => {
    const { api } = openAs('viewer', '/admin/account');
    await screen.findByRole('button', { name: /reload access/i });
    const release = api.holdNextMe();

    await userEvent.click(screen.getByRole('button', { name: /reload access/i }));
    await userEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    await act(async () => {
      release();
    });

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: /main/i })).not.toBeInTheDocument();
  });
});

describe('Layout and keyboard', () => {
  it('moves focus to the page content when the Operator navigates, so keyboard users start there', async () => {
    openAs('inbox_manager', '/admin/');
    await userEvent.click(await screen.findByRole('link', { name: 'Contacts' }));

    expect(await screen.findByRole('heading', { name: 'Contacts' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('keeps the navigation beside the page at laptop width, with no menu button', async () => {
    openAs('viewer', '/admin/');

    expect(await screen.findByRole('navigation', { name: /main/i })).toBeVisible();
    expect(screen.queryByRole('button', { name: /open navigation/i })).not.toBeInTheDocument();
  });

  it('tucks the navigation behind a menu button at tablet width', async () => {
    setViewportWidth(768);
    openAs('viewer', '/admin/');
    const menu = await screen.findByRole('button', { name: /open navigation/i });
    expect(screen.queryByRole('navigation', { name: /main/i })).not.toBeInTheDocument();

    await userEvent.click(menu);
    expect(await screen.findByRole('navigation', { name: /main/i })).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('navigation', { name: /main/i })).not.toBeInTheDocument()
    );
  });

  it('lets a keyboard user skip straight to the page content', async () => {
    openAs('viewer', '/admin/');
    await screen.findByRole('navigation', { name: /main/i });

    await userEvent.tab();
    const skip = screen.getByRole('link', { name: /skip to main content/i });
    expect(skip).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    expect(screen.getByRole('main')).toHaveFocus();
  });
});
