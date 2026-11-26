import { SEEDED_ROLES } from '@fullstack-lab/constants';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { fakeAuthApi } from './test/fakeAuthApi';
import { installFakeGoogle } from './test/fakeGoogle';
import { fakeRolesApi, makeFullRoles, type FakeRoleSeed } from './test/fakeRolesApi';
import { leaveStoredSession, renderPanelAt } from './test/renderPanel';
import { ROLE_ACCESS, type SeededRole } from './test/roles';

function openRoles(role: SeededRole, seed?: FakeRoleSeed[]) {
  installFakeGoogle();
  const auth = fakeAuthApi({ access: ROLE_ACCESS[role] });
  const roles = fakeRolesApi(seed ?? makeFullRoles(), auth);
  leaveStoredSession(auth.seedRefreshToken());
  const rendered = renderPanelAt('/admin/roles');
  return { auth, roles, ...rendered };
}

describe('Role administration', () => {
  it('lists Roles with protected badges and shows super_admin as implicit full catalogue', async () => {
    openRoles('super_admin');
    await screen.findByRole('grid');

    expect(await screen.findByText('super_admin')).toBeInTheDocument();
    expect(screen.getByText('Full Permission catalogue (implicit)')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.getByText('Protected')).toBeInTheDocument();
    expect(screen.getByText('blog_editor')).toBeInTheDocument();
  });

  it('allows creating a custom Role from Permissions in the catalogue', async () => {
    const user = userEvent.setup();
    openRoles('super_admin');
    await screen.findByText('blog_editor');

    await user.click(screen.getByRole('button', { name: 'Create role' }));
    const dialog = await screen.findByRole('dialog', { name: 'Create Role' });

    await user.type(within(dialog).getByLabelText(/Role name/i), 'release_manager');
    await user.click(within(dialog).getByRole('checkbox', { name: 'project:create' }));
    await user.click(within(dialog).getByRole('checkbox', { name: 'blog:update' }));
    await user.click(within(dialog).getByRole('button', { name: 'Create role' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('release_manager')).toBeInTheDocument();
    });
  });

  it('validates role name format client-side and surfaces server field validation errors', async () => {
    const user = userEvent.setup();
    const { roles } = openRoles('super_admin');
    await screen.findByText('blog_editor');

    await user.click(screen.getByRole('button', { name: 'Create role' }));
    const dialog = await screen.findByRole('dialog', { name: 'Create Role' });

    await user.type(within(dialog).getByLabelText(/Role name/i), 'Bad Role Name');
    await user.click(within(dialog).getByRole('button', { name: 'Create role' }));
    expect(
      await within(dialog).findByText(/Must start with a letter and use 2–40 lowercase/i)
    ).toBeInTheDocument();

    roles.failNextCreateValidation('Invalid request body', [
      { field: 'permissions', message: 'Unknown permission' },
    ]);
    const nameInput = within(dialog).getByLabelText(/Role name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'valid_custom_role');
    await user.click(within(dialog).getByRole('button', { name: 'Create role' }));

    expect(await within(dialog).findByText('Unknown permission')).toBeInTheDocument();
  });

  it('keeps super_admin locked, lets Super Admin update admin permissions, and locks admin from changing admin', async () => {
    const user = userEvent.setup();
    const superSession = openRoles('super_admin');
    await screen.findByText('admin');

    expect(
      screen.getByRole('button', { name: `Edit role ${SEEDED_ROLES.SUPER_ADMIN}` })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: `Delete role ${SEEDED_ROLES.SUPER_ADMIN}` })
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete role admin' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Edit role admin' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit Role: admin' });
    expect(within(dialog).getByLabelText(/Role name/i)).toBeDisabled();
    await user.click(within(dialog).getByRole('checkbox', { name: 'project:delete' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('project:delete')).toBeInTheDocument();
    superSession.unmount();

    // Now open as an admin (not super_admin) and verify protected "admin" role cannot be edited.
    openRoles('admin');
    const adminEdit = await screen.findByRole('button', { name: 'Edit role admin' });
    expect(adminEdit).toBeDisabled();
  });

  it('deletes an unassigned custom Role with confirmation and surfaces 409 when a Role is assigned', async () => {
    const user = userEvent.setup();
    openRoles('super_admin');
    await screen.findByText('blog_editor');

    // Attempt to delete support_agent (assigned to 2 Operators -> 409)
    await user.click(screen.getByRole('button', { name: 'Delete role support_agent' }));
    const conflictConfirm = await screen.findByRole('dialog', { name: /Delete this role/i });
    await user.click(within(conflictConfirm).getByRole('button', { name: 'Delete' }));
    expect(
      await screen.findByText(/This Role is still assigned to 2 Operator\(s\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText('support_agent')).toBeInTheDocument();

    // Delete unassigned blog_editor
    await user.click(screen.getByRole('button', { name: 'Delete role blog_editor' }));
    const confirm = await screen.findByRole('dialog', { name: /Delete this role/i });
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.queryByText('blog_editor')).not.toBeInTheDocument());
  });
});
