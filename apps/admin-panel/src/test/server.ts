import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const API_URL = 'http://api.test';

/** Default API behaviour for every test; override per test with server.use(...). */
export const server = setupServer(
  http.get(`${API_URL}/health/live`, () => HttpResponse.json({ alive: true, uptime: 1 }))
);
