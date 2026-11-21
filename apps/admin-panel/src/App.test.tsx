import { createMemoryHistory } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { App } from './App';
import { API_URL, server } from './test/server';

function renderPanelAt(path: string) {
  const history = createMemoryHistory({ initialEntries: [path] });
  return render(<App history={history} />);
}

describe('Admin panel', () => {
  it('opens at /admin and shows that the API is reachable', async () => {
    renderPanelAt('/admin/');

    expect(await screen.findByRole('heading', { name: /admin panel/i })).toBeInTheDocument();
    expect(await screen.findByText(/api reachable/i)).toBeInTheDocument();
  });

  it('says so when the API cannot be reached', async () => {
    server.use(http.get(`${API_URL}/health/live`, () => HttpResponse.error()));

    renderPanelAt('/admin/');

    expect(await screen.findByText(/api unreachable/i)).toBeInTheDocument();
  });

  it('shows a not-found screen inside the panel for an unknown deep link', async () => {
    renderPanelAt('/admin/does/not/exist');

    expect(await screen.findByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });
});
