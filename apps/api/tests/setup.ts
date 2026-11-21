/**
 * Test Setup File
 * This file runs before each test file
 */

import { beforeAll, afterAll, vi } from 'vitest';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5051'; // Different port for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';
process.env.ADMIN_TOKEN = 'test-admin-token';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-0123456789abcdef';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-0123456789abcdef';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id.apps.googleusercontent.com';
process.env.SUPER_ADMIN_EMAIL = 'owner@example.com';
process.env.CLOUDFLARE_R2_ACCOUNT_ID = 'test-account';
process.env.CLOUDFLARE_R2_ACCESS_KEY_ID = 'test-key';
process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY = 'test-secret';
process.env.CLOUDFLARE_R2_BUCKET_NAME = 'test-bucket';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX = '1000'; // Higher limit for tests

// Mock external services
beforeAll(() => {
  // Mock console to reduce noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});
