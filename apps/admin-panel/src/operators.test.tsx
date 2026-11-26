import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { fakeAuthApi } from './test/fakeAuthApi';
import { fakeOperatorsApi, makeOperators, type OperatorRow } from './test/fakeOperatorsApi';
import { installFakeGoogle } from './test/fakeGoogle';
import { leaveStoredSession, renderPanelAt } from './test/renderPanel';
import { ROLE_ACCESS, type SeededRole } from './test/roles';

function openOperators(
  role: SeededRole,
  options: {
    rows?: OperatorRow[];
    path?: string;
    failFirstListWith?: number;
    extraRoles?: { name: string; permissions?: string[] }[];
  } = {}
) {
  installFakeGoogle();
  const auth = fakeAuthApi({ access: ROLE_ACCESS[role] });
  const now = '2025-01-05T00:00:00.000Z';
  const operators = fakeOperatorsApi(
    options.rows ?? makeOperators(),
    auth,
    (options.extraRoles ?? []).map((r, i) => ({
      id: `custom-role-${i}`,
      name: r.name,
      isProtected: false,
      permissions: r.permissions ?? [],
      createdAt: now,
      updatedAt: now,
    }))
  );
  if (options.failFirstListWith) operators.failNextList(options.failFirstListWith);
  leaveStoredSession(auth.seedRefreshToken());
  const rendered = renderPanelAt(options.path ?? '/admin/operators');
  return { auth, operators, ...rendered };
}

async function waitForRows() {
  await screen.findByRole('grid');
  await screen.findByText('bootstrap@example.com');
}

describe('Operator administration', () => {
  describe('Operators list', () => {
    it('shows each operator’s email, roles and whether they are active', async () => {
      openOperators('super_admin');
      await waitForRows();

      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('content@example.com')).toBeInTheDocument();
      expect(screen.getByText('viewer@example.com')).toBeInTheDocument();

      // Status badges
      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges.length).toBeGreaterThanOrEqual(3);
      expect(screen.getByText('Deactivated')).toBeInTheDocument();

      // Roles chips
      expect(screen.getByText('super_admin')).toBeInTheDocument();
      expect(screen.getByText('content_manager')).toBeInTheDocument();

      // Bootstrap badge
      expect(screen.getByText('Bootstrap')).toBeInTheDocument();
    });
  });

  describe('Pre-registering an Operator', () => {
    it('allows a Super Admin to pre-register an Operator by email with initial roles', async () => {
      const user = userEvent.setup();
      openOperators('super_admin');
      await waitForRows();

      const preRegisterBtn = screen.getByRole('button', { name: 'Pre-register operator' });
      await user.click(preRegisterBtn);

      expect(screen.getByRole('dialog', { name: 'Pre-register Operator' })).toBeInTheDocument();

      const emailInput = screen.getByRole('textbox', { name: 'Operator Email' });
      await user.type(emailInput, 'newbie@example.com');

      const roleCheckbox = screen.getByRole('checkbox', { name: 'content_manager' });
      await user.click(roleCheckbox);

      const submitBtn = screen.getByRole('button', { name: 'Pre-register' });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.getByText('newbie@example.com')).toBeInTheDocument();
      });
    });

    it('shows server duplicate error when pre-registering an existing email', async () => {
      const user = userEvent.setup();
      openOperators('super_admin');
      await waitForRows();

      await user.click(screen.getByRole('button', { name: 'Pre-register operator' }));
      const emailInput = screen.getByRole('textbox', { name: 'Operator Email' });
      await user.type(emailInput, 'bootstrap@example.com');

      await user.click(screen.getByRole('button', { name: 'Pre-register' }));

      await waitFor(() => {
        expect(screen.getByText('An Operator with this email already exists')).toBeInTheDocument();
      });
      // Dialog remains open
      expect(screen.getByRole('dialog', { name: 'Pre-register Operator' })).toBeInTheDocument();
    });
  });

  describe('Assigning Roles', () => {
    it('allows a Super Admin to assign or remove any role, including Super Admin and Admin', async () => {
      const user = userEvent.setup();
      openOperators('super_admin');
      await waitForRows();

      const assignBtn = await screen.findByRole('button', {
        name: 'Assign roles to content@example.com',
      });
      await user.click(assignBtn);

      const dialog = await screen.findByRole('dialog', {
        name: 'Assign Roles: content@example.com',
      });
      expect(dialog).toBeInTheDocument();

      // Super Admin sees protected roles enabled
      const superAdminCheckbox = within(dialog).getByRole('checkbox', { name: 'super_admin' });
      const adminCheckbox = within(dialog).getByRole('checkbox', { name: 'admin' });
      expect(superAdminCheckbox).not.toBeDisabled();
      expect(adminCheckbox).not.toBeDisabled();

      // Assign admin role
      await user.click(adminCheckbox);
      await user.click(within(dialog).getByRole('button', { name: 'Save roles' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Verify row now shows admin role
      const contentRow = screen
        .getByText('content@example.com')
        .closest('[role="row"]') as HTMLElement;
      expect(within(contentRow).getByText('admin')).toBeInTheDocument();
    });

    it('disables protected role controls with an explanation when viewed by an Admin', async () => {
      const user = userEvent.setup();
      openOperators('admin');
      await waitForRows();

      // 1. In Pre-register dialog
      await user.click(screen.getByRole('button', { name: 'Pre-register operator' }));
      const preRegDialog = await screen.findByRole('dialog', { name: 'Pre-register Operator' });

      const preRegSuperAdminCheckbox = within(preRegDialog).getByRole('checkbox', {
        name: 'super_admin',
      });
      const preRegAdminCheckbox = within(preRegDialog).getByRole('checkbox', { name: 'admin' });
      expect(preRegSuperAdminCheckbox).toBeDisabled();
      expect(preRegAdminCheckbox).toBeDisabled();
      expect(
        within(preRegDialog).getAllByText('Only a Super Admin can grant or remove a protected Role')
          .length
      ).toBeGreaterThanOrEqual(1);

      await user.click(within(preRegDialog).getByRole('button', { name: 'Cancel' }));

      // 2. In Assign Roles dialog for regular operator
      const assignBtn = await screen.findByRole('button', {
        name: 'Assign roles to content@example.com',
      });
      await user.click(assignBtn);

      const assignDialog = await screen.findByRole('dialog', {
        name: 'Assign Roles: content@example.com',
      });
      const assignSuperAdminCheckbox = within(assignDialog).getByRole('checkbox', {
        name: 'super_admin',
      });
      const assignAdminCheckbox = within(assignDialog).getByRole('checkbox', { name: 'admin' });
      const assignViewerCheckbox = within(assignDialog).getByRole('checkbox', { name: 'viewer' });

      expect(assignSuperAdminCheckbox).toBeDisabled();
      expect(assignAdminCheckbox).toBeDisabled();
      expect(assignViewerCheckbox).not.toBeDisabled();
      expect(
        within(assignDialog).getAllByText('Only a Super Admin can grant or remove a protected Role')
          .length
      ).toBeGreaterThanOrEqual(1);
    });

    it('disables controls to change a Super Admin’s roles when viewed by an Admin', async () => {
      openOperators('admin');
      await waitForRows();

      const assignSuperAdminBtn = await screen.findByRole('button', {
        name: 'Assign roles to bootstrap@example.com',
      });
      expect(assignSuperAdminBtn).toBeDisabled();
      expect(assignSuperAdminBtn).toHaveAttribute(
        'title',
        "Only a Super Admin can change a Super Admin's Roles"
      );
    });

    it('loads custom Roles from GET /roles into both Pre-register and Assign Roles dialogs', async () => {
      const user = userEvent.setup();
      openOperators('super_admin', {
        extraRoles: [{ name: 'release_editor', permissions: ['blog:create'] }],
      });
      await waitForRows();

      await user.click(screen.getByRole('button', { name: 'Pre-register operator' }));
      const preReg = await screen.findByRole('dialog', { name: 'Pre-register Operator' });
      expect(await within(preReg).findByRole('checkbox', { name: 'release_editor' })).toBeEnabled();
      await user.click(within(preReg).getByRole('button', { name: 'Cancel' }));

      await user.click(
        await screen.findByRole('button', { name: 'Assign roles to content@example.com' })
      );
      const assign = await screen.findByRole('dialog', {
        name: 'Assign Roles: content@example.com',
      });
      const customBox = await within(assign).findByRole('checkbox', { name: 'release_editor' });
      await user.click(customBox);
      await user.click(within(assign).getByRole('button', { name: 'Save roles' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

      const contentRow = screen
        .getByText('content@example.com')
        .closest('[role="row"]') as HTMLElement;
      expect(within(contentRow).getByText('release_editor')).toBeInTheDocument();
    });
  });

  describe('Bootstrap Super Admin locks', () => {
    it('locks bootstrap Super Admin from deactivation and demotion', async () => {
      const user = userEvent.setup();
      openOperators('super_admin');
      await waitForRows();

      // Deactivate is disabled with reason
      const deactivateBtn = await screen.findByRole('button', {
        name: 'Deactivate bootstrap@example.com',
      });
      expect(deactivateBtn).toBeDisabled();
      expect(deactivateBtn).toHaveAttribute(
        'title',
        'The bootstrap Super Admin cannot be deactivated'
      );

      // In Assign roles, super_admin cannot be removed
      const assignBtn = await screen.findByRole('button', {
        name: 'Assign roles to bootstrap@example.com',
      });
      await user.click(assignBtn);

      const dialog = await screen.findByRole('dialog', {
        name: 'Assign Roles: bootstrap@example.com',
      });
      const superAdminCheckbox = within(dialog).getByRole('checkbox', { name: 'super_admin' });
      expect(superAdminCheckbox).toBeDisabled();
      expect(superAdminCheckbox).toBeChecked();
      expect(
        within(dialog).getByText('The bootstrap Super Admin cannot lose Super Admin')
      ).toBeInTheDocument();
    });
  });

  describe('Deactivating an Operator', () => {
    it('asks for confirmation and takes effect immediately upon confirming', async () => {
      const user = userEvent.setup();
      openOperators('super_admin');
      await waitForRows();

      const deactivateBtn = await screen.findByRole('button', {
        name: 'Deactivate content@example.com',
      });
      await user.click(deactivateBtn);

      // Confirm dialog appears
      const confirmDialog = await screen.findByRole('dialog');
      expect(
        within(confirmDialog).getByText('Deactivate content@example.com?')
      ).toBeInTheDocument();
      expect(
        within(confirmDialog).getByText(
          'Are you sure you want to deactivate content@example.com? Their access will end immediately.'
        )
      ).toBeInTheDocument();

      // Confirming deactivation
      const confirmBtn = within(confirmDialog).getByRole('button', { name: 'Deactivate' });
      await user.click(confirmBtn);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Status in grid updates immediately
      const contentRow = screen
        .getByText('content@example.com')
        .closest('[role="row"]') as HTMLElement;
      expect(within(contentRow).getByText('Deactivated')).toBeInTheDocument();

      // Deactivate action is now disabled
      const deactivatedBtn = within(contentRow).getByRole('button', {
        name: 'Deactivate content@example.com',
      });
      expect(deactivatedBtn).toBeDisabled();
      expect(deactivatedBtn).toHaveAttribute('title', 'Operator is already deactivated');
    });

    it('cancelling the confirmation leaves the Operator active', async () => {
      const user = userEvent.setup();
      openOperators('super_admin');
      await waitForRows();

      const deactivateBtn = await screen.findByRole('button', {
        name: 'Deactivate content@example.com',
      });
      await user.click(deactivateBtn);

      const cancelBtn = within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Cancel',
      });
      await user.click(cancelBtn);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      const contentRow = screen
        .getByText('content@example.com')
        .closest('[role="row"]') as HTMLElement;
      expect(within(contentRow).getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Permissions gating', () => {
    it('keeps Operators without operator:read permission out entirely', async () => {
      openOperators('content_manager');

      await waitFor(() => {
        expect(screen.getByText('You do not have access to this page')).toBeInTheDocument();
      });
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });

    it('hides action buttons if caller lacks matching permissions', async () => {
      installFakeGoogle();
      const auth = fakeAuthApi({
        access: {
          roles: ['auditor'],
          permissions: ['operator:read'],
        },
      });
      fakeOperatorsApi(makeOperators(), auth);
      leaveStoredSession(auth.seedRefreshToken());
      renderPanelAt('/admin/operators');

      await waitForRows();

      // Cannot see Pre-register button
      expect(
        screen.queryByRole('button', { name: 'Pre-register operator' })
      ).not.toBeInTheDocument();

      // Cannot see Assign roles or Deactivate buttons
      expect(
        screen.queryByRole('button', { name: 'Assign roles to content@example.com' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Deactivate content@example.com' })
      ).not.toBeInTheDocument();
    });
  });

  describe('Server-side errors', () => {
    it('offers retry when operators list fails to load', async () => {
      const user = userEvent.setup();
      openOperators('super_admin', { failFirstListWith: 500 });

      await waitFor(() => {
        expect(screen.getByText('Could not load operators.')).toBeInTheDocument();
      });

      const retryBtn = screen.getByRole('button', { name: 'Try again' });
      await user.click(retryBtn);

      await waitForRows();
      expect(screen.getByText('bootstrap@example.com')).toBeInTheDocument();
    });

    it('shows error notice when server refuses deactivation', async () => {
      const user = userEvent.setup();
      const { operators } = openOperators('super_admin');
      await waitForRows();

      operators.failNextDeactivate(500);

      const deactivateBtn = await screen.findByRole('button', {
        name: 'Deactivate content@example.com',
      });
      await user.click(deactivateBtn);

      const confirmBtn = within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Deactivate',
      });
      await user.click(confirmBtn);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Server error');
      });
    });
  });
});
