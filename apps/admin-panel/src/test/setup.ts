import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { resetViewport, installMatchMedia } from './viewport';
import { server } from './server';
import { removeFakeGoogle } from './fakeGoogle';

// Lazy-loaded DataGrid routes can take >1s to cold-transform under parallel workers / CI VMs.
configure({ asyncUtilTimeout: 3000 });
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
