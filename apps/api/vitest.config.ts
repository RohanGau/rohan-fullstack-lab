import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Global test setup
    globals: true,

    // Test file patterns
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],

    // Exclude patterns
    exclude: ['node_modules', 'dist'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/**', 'dist/**', '**/*.test.ts', '**/types/**', '**/swagger/**'],
    },

    // Timeout for each test
    testTimeout: 10000,

    // Each file starts its own in-memory MongoDB and sends requests through ephemeral ports.
    // Run in parallel, files intermittently saw wrong statuses (400/404 instead of 200/401)
    // and timeouts, about 3 in 10 runs under load; one at a time, 0 in 10 (97 tests).
    // Costs ~7 s (14 s instead of 7 s).
    fileParallelism: false,

    // Setup files (run before each test file)
    setupFiles: ['./tests/setup.ts'],
  },
});
