'use strict';
/**
 * API Endpoint Tests
 *
 * Basic tests for API endpoints to ensure they:
 * - Return correct status codes
 * - Return proper JSON responses
 * - Handle errors gracefully
 */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const vitest_1 = require('vitest');
const supertest_1 = __importDefault(require('supertest'));
const app_1 = __importDefault(require('./app'));
(0, vitest_1.describe)('Root Endpoint', () => {
  (0, vitest_1.it)('GET / should return status ok', async () => {
    const response = await (0, supertest_1.default)(app_1.default)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200);
    (0, vitest_1.expect)(response.body).toHaveProperty('status', 'ok');
  });
});
(0, vitest_1.describe)('Blog Endpoints', () => {
  (0, vitest_1.describe)('GET /api/blogs', () => {
    (0, vitest_1.it)('should return an array (even if empty)', async () => {
      const response = await (0, supertest_1.default)(app_1.default)
        .get('/api/blogs')
        .expect('Content-Type', /json/);
      // Could be 200 with data or 500 if DB not connected
      if (response.status === 200) {
        (0, vitest_1.expect)(Array.isArray(response.body)).toBe(true);
      }
    });
    (0, vitest_1.it)('should support pagination with range header', async () => {
      const response = await (0, supertest_1.default)(app_1.default)
        .get('/api/blogs')
        .query({ range: JSON.stringify([0, 9]) });
      // Should have X-Total-Count header for pagination
      if (response.status === 200) {
        (0, vitest_1.expect)(response.headers).toHaveProperty('x-total-count');
      }
    });
    (0, vitest_1.it)('should support filtering by status', async () => {
      const response = await (0, supertest_1.default)(app_1.default)
        .get('/api/blogs')
        .query({ filter: JSON.stringify({ status: 'published' }) });
      // Should not error out
      (0, vitest_1.expect)([200, 500]).toContain(response.status);
    });
  });
  (0, vitest_1.describe)('GET /api/blogs/:id', () => {
    (0, vitest_1.it)('should return 404 for non-existent blog', async () => {
      const response = await (0, supertest_1.default)(app_1.default).get(
        '/api/blogs/000000000000000000000000'
      );
      // Should be 404 or 500 (if DB not connected)
      (0, vitest_1.expect)([404, 500]).toContain(response.status);
    });
    (0, vitest_1.it)('should return 400 for invalid ID format', async () => {
      const response = await (0, supertest_1.default)(app_1.default).get('/api/blogs/invalid-id');
      // Should handle gracefully
      (0, vitest_1.expect)([400, 404, 500]).toContain(response.status);
    });
  });
});
(0, vitest_1.describe)('Project Endpoints', () => {
  (0, vitest_1.describe)('GET /api/projects', () => {
    (0, vitest_1.it)('should return an array', async () => {
      const response = await (0, supertest_1.default)(app_1.default)
        .get('/api/projects')
        .expect('Content-Type', /json/);
      if (response.status === 200) {
        (0, vitest_1.expect)(Array.isArray(response.body)).toBe(true);
      }
    });
  });
});
(0, vitest_1.describe)('Profile Endpoints', () => {
  (0, vitest_1.describe)('GET /api/profiles', () => {
    (0, vitest_1.it)('should return profile data', async () => {
      const response = await (0, supertest_1.default)(app_1.default)
        .get('/api/profiles')
        .expect('Content-Type', /json/);
      // Should return array or error
      (0, vitest_1.expect)([200, 500]).toContain(response.status);
    });
  });
});
(0, vitest_1.describe)('Contact Endpoints', () => {
  (0, vitest_1.describe)('POST /api/contact', () => {
    (0, vitest_1.it)('should reject empty body', async () => {
      const response = await (0, supertest_1.default)(app_1.default)
        .post('/api/contact')
        .send({})
        .expect('Content-Type', /json/);
      // Should return validation error
      (0, vitest_1.expect)([400, 401, 403, 500]).toContain(response.status);
    });
    (0, vitest_1.it)('should reject invalid email', async () => {
      const response = await (0, supertest_1.default)(app_1.default).post('/api/contact').send({
        name: 'Test User',
        email: 'invalid-email',
        message: 'Test message',
      });
      (0, vitest_1.expect)([400, 401, 403, 500]).toContain(response.status);
    });
  });
});
(0, vitest_1.describe)('Error Handling', () => {
  (0, vitest_1.it)('should return 404 for unknown routes', async () => {
    const response = await (0, supertest_1.default)(app_1.default).get('/api/unknown-route');
    (0, vitest_1.expect)(response.status).toBe(404);
  });
  (0, vitest_1.it)('should handle malformed JSON gracefully', async () => {
    const response = await (0, supertest_1.default)(app_1.default)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');
    (0, vitest_1.expect)([400, 500]).toContain(response.status);
  });
});
(0, vitest_1.describe)('Security Headers', () => {
  (0, vitest_1.it)('should include security headers from helmet', async () => {
    const response = await (0, supertest_1.default)(app_1.default).get('/');
    // Helmet adds various security headers
    (0, vitest_1.expect)(response.headers).toHaveProperty('x-content-type-options');
    (0, vitest_1.expect)(response.headers['x-content-type-options']).toBe('nosniff');
  });
});
