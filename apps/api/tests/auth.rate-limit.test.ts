/**
 * The Operator sign-in endpoints are rate limited per client, through the real app.
 * Kept in its own file: the limiter's counter lives for the whole test process.
 */
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { buildTestApp } from './helpers/app';
import { GOOGLE_AUTH_MAX_REQUESTS } from '../src/middleware/authRateLimit';

const app = buildTestApp();

describe('rate limiting of Operator sign-in endpoints', () => {
  it('refuses requests beyond the limit with 429, and the nonce and sign-in endpoints share one budget', async () => {
    for (let i = 0; i < GOOGLE_AUTH_MAX_REQUESTS; i += 1) {
      const res = await request(app).post('/api/v1/auth/google/nonce');
      expect(res.status).toBe(200);
    }

    const nonceOver = await request(app).post('/api/v1/auth/google/nonce');
    const signInOver = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'fake-google-id-token', nonce: 'a-nonce-that-was-never-issued' });

    expect(nonceOver.status).toBe(429);
    expect(signInOver.status).toBe(429);
  });
});
