import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { fakeAuthApi } from './test/fakeAuthApi';
import { fakeContactsApi, makeContacts, type ContactRow } from './test/fakeContactsApi';
import { installFakeGoogle } from './test/fakeGoogle';
import { leaveStoredSession, renderPanelAt } from './test/renderPanel';
import { ROLE_ACCESS, type SeededRole } from './test/roles';

const FORBIDDEN_MESSAGE =
  'You do not have permission to do that. Ask an administrator for a Role that includes it.';

function openContacts(
  role: SeededRole,
  options: {
    rows?: ContactRow[];
    path?: string;
    failFirstListWith?: number;
    omitTotalHeader?: boolean;
  } = {}
) {
  installFakeGoogle();
  const auth = fakeAuthApi({ access: ROLE_ACCESS[role] });
  const contacts = fakeContactsApi(options.rows ?? makeContacts(3), auth);
  if (options.failFirstListWith) contacts.failNextList(options.failFirstListWith);
  if (options.omitTotalHeader) contacts.omitTotalHeader();
  leaveStoredSession(auth.seedRefreshToken());
  const rendered = renderPanelAt(options.path ?? '/admin/contacts');
  return { auth, contacts, ...rendered };
}

async function grid() {
  return screen.findByRole('grid');
}

/** The sender names in the rows on screen, top to bottom. */
function senders(): string[] {
  const rows = within(screen.getByRole('grid')).getAllByRole('row').slice(1);
  return rows.map((row) => within(row).getAllByRole('gridcell')[0]?.textContent ?? '');
}

describe('Contacts list', () => {
  it('lists messages newest first with sender, email, message and date', async () => {
    const { contacts } = openContacts('inbox_manager');
    await grid();
    await waitFor(() => expect(senders()).toEqual(['Sender 00', 'Sender 01', 'Sender 02']));

    const firstRow = within(screen.getByRole('grid')).getAllByRole('row')[1]!;
    expect(within(firstRow).getByText('sender0@example.com')).toBeInTheDocument();
    expect(within(firstRow).getByText('Message number 0')).toBeInTheDocument();
    expect(within(firstRow).getByText(/30 Mar 2025/)).toBeInTheDocument();
    expect(contacts.lastList()).toMatchObject({
      range: [0, 24],
      sort: ['createdAt', 'DESC'],
      filter: {},
    });
    expect(contacts.lastList().authorization).toMatch(/^Bearer access-/);
  });

  it('pages through the results using the server’s total', async () => {
    const { contacts } = openContacts('inbox_manager', { rows: makeContacts(30) });
    await waitFor(() => expect(senders()).toHaveLength(25));
    expect(screen.getByText(/1–25 of 30/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /go to next page/i }));

    await waitFor(() => expect(senders()).toHaveLength(5));
    expect(contacts.lastList().range).toEqual([25, 49]);
    expect(screen.getByText(/26–30 of 30/)).toBeInTheDocument();
  });

  it('sorts on the server when a column header is chosen', async () => {
    const { contacts } = openContacts('inbox_manager');
    await waitFor(() => expect(senders()).toHaveLength(3));

    await userEvent.click(screen.getByRole('columnheader', { name: /^sender/i }));
    await waitFor(() => expect(senders()).toEqual(['Sender 00', 'Sender 01', 'Sender 02']));
    expect(contacts.lastList().sort).toEqual(['name', 'ASC']);

    await userEvent.click(screen.getByRole('columnheader', { name: /^sender/i }));
    await waitFor(() => expect(senders()).toEqual(['Sender 02', 'Sender 01', 'Sender 00']));
    expect(contacts.lastList().sort).toEqual(['name', 'DESC']);
  });

  it('filters by exact sender or email on the server, and clears the filters', async () => {
    const { contacts } = openContacts('inbox_manager');
    await waitFor(() => expect(senders()).toHaveLength(3));

    await userEvent.type(screen.getByLabelText(/sender \(exact match\)/i), 'Sender 01');
    await userEvent.click(screen.getByRole('button', { name: /apply filters/i }));
    await waitFor(() => expect(senders()).toEqual(['Sender 01']));
    expect(contacts.lastList().filter).toEqual({ name: 'Sender 01' });

    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    await waitFor(() => expect(senders()).toHaveLength(3));
    expect(contacts.lastList().filter).toEqual({});
  });

  it('opens a message in full from its row', async () => {
    const rows = makeContacts(2);
    rows[0]!.message = 'A long message that the table would cut short, in full.';
    openContacts('viewer', { rows });
    await waitFor(() => expect(senders()).toHaveLength(2));

    await userEvent.click(screen.getByRole('button', { name: /view message from sender 00/i }));

    const dialog = await screen.findByRole('dialog', { name: /message from sender 00/i });
    expect(
      within(dialog).getByText('A long message that the table would cut short, in full.')
    ).toBeInTheDocument();
    expect(within(dialog).getByText('sender0@example.com')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: /close/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('Odd responses and addresses', () => {
  it('still shows the messages, with a sensible footer, when the API sends no total', async () => {
    openContacts('inbox_manager', { omitTotalHeader: true });

    await waitFor(() => expect(senders()).toEqual(['Sender 00', 'Sender 01', 'Sender 02']));
    expect(screen.getByText(/1–3 of 3/)).toBeInTheDocument();
  });

  it('ignores a page number that is not sensible and shows the first page', async () => {
    const { contacts } = openContacts('inbox_manager', { path: '/admin/contacts?page=999999999' });

    await waitFor(() => expect(senders()).toHaveLength(3));
    expect(contacts.lastList().range).toEqual([0, 24]);
  });

  it('ignores filter text that is far longer than any real name or email', async () => {
    const { contacts } = openContacts('inbox_manager', {
      path: `/admin/contacts?name=${'a'.repeat(300)}`,
    });

    await waitFor(() => expect(senders()).toHaveLength(3));
    expect(contacts.lastList().filter).toEqual({});
  });

  it('keeps what the Operator has typed in a filter when something else on the page changes', async () => {
    openContacts('inbox_manager');
    await waitFor(() => expect(senders()).toHaveLength(3));
    await userEvent.type(screen.getByLabelText(/sender \(exact match\)/i), 'Sen');

    await userEvent.click(screen.getByRole('columnheader', { name: /^sender/i }));
    await waitFor(() => expect(senders()).toEqual(['Sender 00', 'Sender 01', 'Sender 02']));

    expect(screen.getByLabelText(/sender \(exact match\)/i)).toHaveValue('Sen');
  });
});

describe('Deleting a message', () => {
  it('asks first, and deletes only when confirmed', async () => {
    const { contacts } = openContacts('inbox_manager');
    await waitFor(() => expect(senders()).toHaveLength(3));

    await userEvent.click(screen.getByRole('button', { name: /delete message from sender 00/i }));
    const dialog = await screen.findByRole('dialog', { name: /delete this message/i });
    expect(within(dialog).getByText(/sender 00/i)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(contacts.deleteRequests).toHaveLength(0);
    expect(senders()).toHaveLength(3);

    await userEvent.click(screen.getByRole('button', { name: /delete message from sender 00/i }));
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: /delete this message/i })).getByRole(
        'button',
        {
          name: /^delete$/i,
        }
      )
    );

    await waitFor(() => expect(senders()).toEqual(['Sender 01', 'Sender 02']));
    expect(contacts.deleteRequests).toEqual([
      { id: 'contact-0', authorization: expect.stringMatching(/^Bearer access-/) },
    ]);
  });

  it('keeps the message and explains when the API refuses with 403', async () => {
    const { contacts } = openContacts('inbox_manager');
    await waitFor(() => expect(senders()).toHaveLength(3));
    contacts.failNextDelete(403);

    await userEvent.click(screen.getByRole('button', { name: /delete message from sender 00/i }));
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: /delete this message/i })).getByRole(
        'button',
        {
          name: /^delete$/i,
        }
      )
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(FORBIDDEN_MESSAGE);
    expect(senders()).toHaveLength(3);
  });

  it('goes back a page when the last message on a page is deleted', async () => {
    openContacts('inbox_manager', { rows: makeContacts(26) });
    await waitFor(() => expect(senders()).toHaveLength(25));
    await userEvent.click(screen.getByRole('button', { name: /go to next page/i }));
    await waitFor(() => expect(senders()).toEqual(['Sender 25']));

    await userEvent.click(screen.getByRole('button', { name: /delete message from sender 25/i }));
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: /delete this message/i })).getByRole(
        'button',
        {
          name: /^delete$/i,
        }
      )
    );

    expect(await screen.findByText(/1–25 of 25/)).toBeInTheDocument();
    expect(senders()).toHaveLength(25);
  });
});

describe('What each Role can do with contacts', () => {
  it.each(['super_admin', 'admin', 'inbox_manager'] as const)(
    'lets %s read and delete',
    async (role) => {
      openContacts(role);
      await waitFor(() => expect(senders()).toHaveLength(3));

      expect(
        screen.getByRole('button', { name: /delete message from sender 00/i })
      ).toBeInTheDocument();
    }
  );

  it('shows a viewer the messages with no way to delete', async () => {
    openContacts('viewer');
    await waitFor(() => expect(senders()).toHaveLength(3));

    expect(
      screen.getByRole('button', { name: /view message from sender 00/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete message/i })).not.toBeInTheDocument();
  });

  it('keeps content managers out entirely', async () => {
    openContacts('content_manager');

    expect(
      await screen.findByRole('heading', { name: 'You do not have access to this page' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });
});

describe('Loading, empty and failed states', () => {
  it('says there are no messages yet when there are none', async () => {
    openContacts('inbox_manager', { rows: [] });

    expect(await screen.findByText('No messages yet.')).toBeInTheDocument();
  });

  it('says so when no message matches the filters', async () => {
    openContacts('inbox_manager');
    await waitFor(() => expect(senders()).toHaveLength(3));

    await userEvent.type(screen.getByLabelText(/sender \(exact match\)/i), 'Nobody');
    await userEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    expect(await screen.findByText('No messages match these filters.')).toBeInTheDocument();
  });

  it('offers a retry when the list cannot be loaded', async () => {
    openContacts('inbox_manager', { failFirstListWith: 500 });

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load messages.');
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => expect(senders()).toHaveLength(3));
  });
});

describe('The list remembers where the Operator was', () => {
  it('opens a link with its page, sort and filters already applied', async () => {
    const { contacts } = openContacts('inbox_manager', {
      rows: makeContacts(30),
      path: '/admin/contacts?page=2&sort=name&order=asc',
    });

    await waitFor(() => expect(senders()).toHaveLength(5));
    expect(contacts.lastList()).toMatchObject({ range: [25, 49], sort: ['name', 'ASC'] });
  });

  it('comes back to the same page, sort and filter after visiting another screen', async () => {
    const { contacts, history } = openContacts('inbox_manager', { rows: makeContacts(30) });
    await waitFor(() => expect(senders()).toHaveLength(25));
    await userEvent.click(screen.getByRole('columnheader', { name: /^sender/i }));
    await userEvent.click(screen.getByRole('button', { name: /go to next page/i }));
    await waitFor(() => expect(senders()).toHaveLength(5));

    await userEvent.click(screen.getByRole('link', { name: 'Overview' }));
    await screen.findByRole('heading', { name: /^admin panel$/i });
    act(() => history.back());

    await waitFor(() => expect(senders()).toHaveLength(5));
    expect(contacts.lastList()).toMatchObject({ range: [25, 49], sort: ['name', 'ASC'] });
  });
});

describe('When the API refuses or the session changes while using a list', () => {
  it('reads the Operator’s access again after a 403, so navigation follows their new Roles', async () => {
    const { auth, contacts } = openContacts('inbox_manager', { path: '/admin/' });
    await screen.findByRole('link', { name: 'Contacts' });
    auth.changeAccess(ROLE_ACCESS.content_manager); // an administrator changed their Roles
    contacts.failNextList(403);

    await userEvent.click(screen.getByRole('link', { name: 'Contacts' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(FORBIDDEN_MESSAGE);
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'Contacts' })).not.toBeInTheDocument()
    );
    expect(
      await screen.findByRole('heading', { name: 'You do not have access to this page' })
    ).toBeInTheDocument();
  });

  it('never sends a refresh token twice when two requests need a new access token at once', async () => {
    const { auth } = openContacts('inbox_manager', { rows: makeContacts(30) });
    await waitFor(() => expect(senders()).toHaveLength(25));
    const refreshesBefore = auth.calls.refresh.length;
    auth.expireAccessTokens();

    await Promise.all([
      userEvent.click(screen.getByRole('button', { name: /go to next page/i })),
      userEvent.click(screen.getByRole('columnheader', { name: /^sender/i })),
    ]);

    await waitFor(() => expect(auth.calls.refresh.length).toBeGreaterThan(refreshesBefore));
    await waitFor(() => expect(senders().length).toBeGreaterThan(0));
    expect(auth.rejectedRefreshCount()).toBe(0); // a spent token was never used again
    expect(screen.queryByRole('heading', { name: /sign in/i })).not.toBeInTheDocument();
  });
});
