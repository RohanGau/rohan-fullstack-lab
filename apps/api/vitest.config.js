'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const config_1 = require('vitest/config');
exports.default = (0, config_1.defineConfig)({
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
    // Setup files (run before each test file)
    setupFiles: ['./tests/setup.ts'],
  },
});
