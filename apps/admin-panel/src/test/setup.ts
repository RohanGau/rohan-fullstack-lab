import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './server';
import { removeFakeGoogle } from './fakeGoogle';

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  cleanup();
  removeFakeGoogle();
  window.localStorage.clear();
  server.resetHandlers();
});
afterAll(() => server.close());
