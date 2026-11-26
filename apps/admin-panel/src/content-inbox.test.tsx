import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { fakeAuthApi } from './test/fakeAuthApi';
import { fakeContentApi } from './test/fakeContentApi';
import { installFakeGoogle } from './test/fakeGoogle';
import { leaveStoredSession, renderPanelAt } from './test/renderPanel';
import { ROLE_ACCESS, type SeededRole } from './test/roles';

function openScreen(role: SeededRole | { roles: string[]; permissions: string[] }, path: string) {
  installFakeGoogle();
  const access = typeof role === 'string' ? ROLE_ACCESS[role] : role;
  const auth = fakeAuthApi({ access });
  const content = fakeContentApi(auth);
  leaveStoredSession(auth.seedRefreshToken());
  const rendered = renderPanelAt(path);
  return { auth, content, ...rendered };
}

describe('Overview telemetry and quick navigation', () => {
  it('shows API liveness, dependency health checks, and quick access links permitted for the Operator', async () => {
    openScreen('inbox_manager', '/admin/');

    expect(await screen.findByText(/API reachable — uptime 1h 1m/i)).toBeInTheDocument();
    expect(screen.getByText('mongodb')).toBeInTheDocument();
    expect(screen.getByText('Latency: 4 ms')).toBeInTheDocument();
    expect(screen.getByText('redis')).toBeInTheDocument();
    expect(screen.getByText('Heap: 128 MB / 512 MB')).toBeInTheDocument();

    const main = screen.getByRole('main');
    expect(within(main).getByRole('link', { name: 'Open Contacts' })).toBeInTheDocument();
    expect(within(main).getByRole('link', { name: 'Open Slots' })).toBeInTheDocument();
    expect(within(main).queryByRole('link', { name: 'Open Blogs' })).not.toBeInTheDocument();
  });
});

describe('Blogs management', () => {
  it('lists, filters, views, creates, edits, and deletes blogs with server error reporting', async () => {
    const user = userEvent.setup();
    const { content } = openScreen('content_manager', '/admin/blogs');
    await screen.findByText('Designing Clean Monorepos');

    // Filter by Status = Published
    await user.click(screen.getByLabelText('Status'));
    await user.click(await screen.findByRole('option', { name: 'Published' }));
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));
    await waitFor(() => {
      expect(screen.queryByText('Edge Caching Draft')).not.toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(await screen.findByText('Edge Caching Draft')).toBeInTheDocument();

    // View detail
    await user.click(screen.getByRole('button', { name: 'View blog "Designing Clean Monorepos"' }));
    const detail = await screen.findByRole('dialog');
    expect(
      within(detail).getByText('Full article body about monorepos and shared contracts.')
    ).toBeInTheDocument();
    await user.click(within(detail).getByRole('button', { name: 'Close' }));

    // Create flow with server validation error recovery
    content.failNextBlogCreate('Validation failed', [
      { field: 'slug', message: 'Slug already taken' },
    ]);
    await user.click(screen.getByRole('button', { name: 'New blog post' }));
    const createDialog = await screen.findByRole('dialog', { name: 'Create Blog Post' });

    await user.type(within(createDialog).getByLabelText(/^Title/i), 'Scaling Queues');
    await user.type(within(createDialog).getByLabelText(/^Author/i), 'Rohan');
    await user.type(
      within(createDialog).getByLabelText(/^Content/i),
      'Workers, backoff strategies, and idempotency keys.'
    );
    await user.type(within(createDialog).getByLabelText(/Add tags/i), 'Queues{Enter}');
    expect(within(createDialog).getByText('queues')).toBeInTheDocument();

    await user.click(within(createDialog).getByRole('button', { name: 'Add link' }));
    await user.type(within(createDialog).getByLabelText('URL'), 'https://example.com/queues');

    await user.click(within(createDialog).getByRole('button', { name: 'Create post' }));
    expect(await within(createDialog).findByText('Slug already taken')).toBeInTheDocument();

    await user.click(within(createDialog).getByRole('button', { name: 'Create post' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('Scaling Queues')).toBeInTheDocument();

    // Edit & Delete
    await user.click(screen.getByRole('button', { name: 'Edit blog "Scaling Queues"' }));
    const editDialog = await screen.findByRole('dialog', { name: 'Edit Blog: Scaling Queues' });
    const titleBox = within(editDialog).getByLabelText(/^Title/i);
    await user.clear(titleBox);
    await user.type(titleBox, 'Scaling Queues v2');
    await user.click(within(editDialog).getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('Scaling Queues v2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete blog "Scaling Queues v2"' }));
    const confirm = await screen.findByRole('dialog', { name: /Delete this blog post/i });
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.queryByText('Scaling Queues v2')).not.toBeInTheDocument());
  });
});

describe('Projects and Profiles CRUD', () => {
  it('supports creating, editing, viewing, and deleting Projects', async () => {
    const user = userEvent.setup();
    openScreen('content_manager', '/admin/projects');
    expect(await screen.findByText('Telemetry Dashboard')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'New project' }));
    const dialog = await screen.findByRole('dialog', { name: 'Create Project' });
    await user.type(within(dialog).getByLabelText(/^Title/i), 'Zero Trust Proxy');
    await user.type(
      within(dialog).getByLabelText(/^Description/i),
      'Local HTTPS reverse proxy with automatic host headers.'
    );
    await user.click(within(dialog).getByRole('button', { name: '+ web' }));
    await user.click(within(dialog).getByRole('button', { name: 'Create project' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('Zero Trust Proxy')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit project "Zero Trust Proxy"' }));
    const edit = await screen.findByRole('dialog', { name: 'Edit Project: Zero Trust Proxy' });
    await user.click(within(edit).getByRole('checkbox', { name: 'Featured on homepage' }));
    await user.click(within(edit).getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Delete project "Zero Trust Proxy"' }));
    const del = await screen.findByRole('dialog', { name: /Delete this project/i });
    await user.click(within(del).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.queryByText('Zero Trust Proxy')).not.toBeInTheDocument());
  });

  it('supports viewing, creating ({ data } response), editing, and deleting Profiles', async () => {
    const user = userEvent.setup();
    openScreen('content_manager', '/admin/profiles');
    expect(await screen.findByText('Rohan Kumar')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'New profile' }));
    const dialog = await screen.findByRole('dialog', { name: 'Create Profile' });
    await user.type(within(dialog).getByLabelText(/^Name/i), 'Ada Lovelace');
    await user.type(within(dialog).getByLabelText(/^Email/i), 'ada@example.com');
    await user.type(within(dialog).getByLabelText(/^Title/i), 'Principal Architect');
    await user.type(within(dialog).getByLabelText(/^Skill Name/i), 'Mathematics');
    await user.click(within(dialog).getByRole('button', { name: 'Create profile' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete profile for Ada Lovelace' }));
    const del = await screen.findByRole('dialog', { name: /Delete this profile/i });
    await user.click(within(del).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument());
  });
});

describe('Slots and R2 Assets permissions & workflows', () => {
  it('enforces read-only Slots for Viewer and full update/delete for Inbox Manager', async () => {
    const user = userEvent.setup();
    const viewerSession = openScreen('viewer', '/admin/slots');
    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View slot for Grace Hopper' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Edit slot/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Delete slot/i })).not.toBeInTheDocument();
    viewerSession.unmount();

    openScreen('inbox_manager', '/admin/slots');
    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit slot for Grace Hopper' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit Slot: Grace Hopper' });
    await user.click(within(dialog).getByLabelText('Status'));
    await user.click(await screen.findByRole('option', { name: 'Cancelled' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save slot' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Delete slot for Linus Torvalds' }));
    const del = await screen.findByRole('dialog', { name: /Delete this slot/i });
    await user.click(within(del).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.queryByText('Linus Torvalds')).not.toBeInTheDocument());
  });

  it('uploads assets via presigned R2 PUT, shows failures, and deletes keys with confirmation', async () => {
    const user = userEvent.setup();
    const { content, unmount } = openScreen('content_manager', '/admin/assets');
    expect(await screen.findByRole('heading', { name: 'Assets' })).toBeInTheDocument();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const pngFile = new File(['png-bytes'], 'hero-banner.png', { type: 'image/png' });

    // Failure case first
    content.failNextR2Put();
    await user.upload(fileInput, pngFile);
    await user.click(await screen.findByRole('button', { name: 'Upload hero-banner.png' }));
    expect(await screen.findByText(/Upload failed \(500/i)).toBeInTheDocument();

    // Success case
    await user.upload(fileInput, pngFile);
    await user.click(await screen.findByRole('button', { name: 'Upload hero-banner.png' }));
    expect(await screen.findByAltText('Preview of hero-banner.png')).toBeInTheDocument();
    expect(await screen.findByText('Uploaded in this session')).toBeInTheDocument();

    // Delete recently uploaded object via session card
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const confirm = await screen.findByRole('dialog', { name: 'Delete this asset?' });
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('status')).toHaveTextContent(/Deleted uploads\/2026\/11\//i);

    // Manual key delete (404 case)
    await user.type(screen.getByLabelText('Object key'), 'uploads/missing.png');
    await user.click(screen.getByRole('button', { name: 'Delete key' }));
    const confirm404 = await screen.findByRole('dialog', { name: 'Delete this asset?' });
    await user.click(within(confirm404).getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('status')).toHaveTextContent(/Object not found in bucket/i);
    unmount();

    // Permission check: upload:delete only hides Upload card
    const deleteOnly = openScreen(
      { roles: ['custom'], permissions: ['upload:delete'] },
      '/admin/assets'
    );
    expect(await screen.findByText('Delete asset by key')).toBeInTheDocument();
    expect(screen.queryByText('Upload to Cloudflare R2')).not.toBeInTheDocument();
    deleteOnly.unmount();
  });
});
