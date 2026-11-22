import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { resetViewport, installMatchMedia } from './viewport';
import { server } from './server';
import { removeFakeGoogle } from './fakeGoogle';

installMatchMedia();

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  cleanup();
  removeFakeGoogle();
  resetViewport();
  window.localStorage.clear();
  server.resetHandlers();
});
afterAll(() => server.close());
