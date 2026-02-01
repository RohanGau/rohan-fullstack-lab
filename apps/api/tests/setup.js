'use strict';
/**
 * Test Setup File
 * This file runs before each test file
 */
Object.defineProperty(exports, '__esModule', { value: true });
const vitest_1 = require('vitest');
// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5051'; // Different port for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';
process.env.ADMIN_TOKEN = 'test-admin-token';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX = '1000'; // Higher limit for tests
// Mock external services
(0, vitest_1.beforeAll)(() => {
  // Mock console to reduce noise in tests
  vitest_1.vi.spyOn(console, 'log').mockImplementation(() => {});
  vitest_1.vi.spyOn(console, 'info').mockImplementation(() => {});
});
(0, vitest_1.afterAll)(() => {
  vitest_1.vi.restoreAllMocks();
});
