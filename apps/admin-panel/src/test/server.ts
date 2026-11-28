import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const API_URL = 'http://api.test';

/** Default API behaviour for every test; override per test with server.use(...). */
export const server = setupServer(
  http.get(`${API_URL}/health/live`, () => HttpResponse.json({ alive: true, uptime: 1 })),
  http.get(`${API_URL}/health`, () =>
    HttpResponse.json({
      status: 'healthy',
      timestamp: '2026-01-01T00:00:00.000Z',
      uptime: 120,
      checks: { mongodb: { status: 'up', latency: 4 } },
    })
  )
);
