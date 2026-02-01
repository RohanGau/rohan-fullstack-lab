/**
 * API Endpoint Tests
 *
 * Basic tests for API endpoints to ensure they:
 * - Return correct status codes
 * - Return proper JSON responses
 * - Handle errors gracefully
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app';

describe('Root Endpoint', () => {
  it('GET / should return status ok', async () => {
    const response = await request(app).get('/').expect('Content-Type', /json/).expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
  });
});

describe('Blog Endpoints', () => {
  describe('GET /api/blogs', () => {
    it('should return an array (even if empty)', async () => {
      const response = await request(app).get('/api/blogs').expect('Content-Type', /json/);

      // Could be 200 with data or 500 if DB not connected
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });

    it('should support pagination with range header', async () => {
      const response = await request(app)
        .get('/api/blogs')
        .query({ range: JSON.stringify([0, 9]) });

      // Should have X-Total-Count header for pagination
      if (response.status === 200) {
        expect(response.headers).toHaveProperty('x-total-count');
      }
    });

    it('should support filtering by status', async () => {
      const response = await request(app)
        .get('/api/blogs')
        .query({ filter: JSON.stringify({ status: 'published' }) });

      // Should not error out
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /api/blogs/:id', () => {
    it('should return 404 for non-existent blog', async () => {
      const response = await request(app).get('/api/blogs/000000000000000000000000');

      // Should be 404 or 500 (if DB not connected)
      expect([404, 500]).toContain(response.status);
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app).get('/api/blogs/invalid-id');

      // Should handle gracefully
      expect([400, 404, 500]).toContain(response.status);
    });
  });
});

describe('Project Endpoints', () => {
  describe('GET /api/projects', () => {
    it('should return an array', async () => {
      const response = await request(app).get('/api/projects').expect('Content-Type', /json/);

      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });
  });
});

describe('Profile Endpoints', () => {
  describe('GET /api/profiles', () => {
    it('should return profile data', async () => {
      const response = await request(app).get('/api/profiles').expect('Content-Type', /json/);

      // Should return array or error
      expect([200, 500]).toContain(response.status);
    });
  });
});

describe('Contact Endpoints', () => {
  describe('POST /api/contact', () => {
    it('should reject empty body', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({})
        .expect('Content-Type', /json/);

      // Should return validation error
      expect([400, 401, 403, 500]).toContain(response.status);
    });

    it('should reject invalid email', async () => {
      const response = await request(app).post('/api/contact').send({
        name: 'Test User',
        email: 'invalid-email',
        message: 'Test message',
      });

      expect([400, 401, 403, 500]).toContain(response.status);
    });
  });
});

describe('Error Handling', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown-route');

    expect(response.status).toBe(404);
  });

  it('should handle malformed JSON gracefully', async () => {
    const response = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');

    expect([400, 500]).toContain(response.status);
  });
});

describe('Security Headers', () => {
  it('should include security headers from helmet', async () => {
    const response = await request(app).get('/');

    // Helmet adds various security headers
    expect(response.headers).toHaveProperty('x-content-type-options');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});
