import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { fakeAuthApi } from './test/fakeAuthApi';
import { installFakeGoogle } from './test/fakeGoogle';
import { leaveStoredSession, renderPanelAt } from './test/renderPanel';
import { API_URL, server } from './test/server';

function openAsSignedInOperator(path: string) {
  installFakeGoogle();
  const api = fakeAuthApi();
  leaveStoredSession(api.seedRefreshToken());
  return renderPanelAt(path);
}

describe('Admin panel', () => {
  it('opens at /admin and shows that the API is reachable', async () => {
    openAsSignedInOperator('/admin/');

    expect(await screen.findByRole('heading', { name: /admin panel/i })).toBeInTheDocument();
    expect(await screen.findByText(/api reachable/i)).toBeInTheDocument();
  });

  it('says so when the API cannot be reached', async () => {
    server.use(http.get(`${API_URL}/health/live`, () => HttpResponse.error()));

    openAsSignedInOperator('/admin/');

    expect(await screen.findByText(/api unreachable/i)).toBeInTheDocument();
  });

  it('shows a not-found screen inside the panel for an unknown deep link', async () => {
    openAsSignedInOperator('/admin/does/not/exist');

    expect(await screen.findByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });
});
