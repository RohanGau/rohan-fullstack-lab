/**
 * CORS allowlist and middleware ordering tests.
 */
import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { buildTestApp } from './helpers/app';
import { GOOGLE_AUTH_MAX_REQUESTS } from '../src/middleware/authRateLimit';
import { isAllowedOrigin } from '../src/utils/constant';

const app = buildTestApp();

describe('CORS configuration', () => {
  it('allows preflight OPTIONS and returns CORS headers for production and Pages admin origins', async () => {
    for (const origin of [
      'https://rohan-admin-panel.pages.dev',
      'https://rohangautam.dev',
      'https://www.rohangautam.dev',
      'https://admin.rohangautam.dev',
      'https://stage.rohangautam.dev',
      'https://develop.rohan-admin-panel.pages.dev',
      'https://abc123.rohan-admin-panel.pages.dev',
    ]) {
      const preflight = await request(app)
        .options('/api/v1/auth/google/nonce')
        .set('Origin', origin)
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type, Authorization');

      expect(preflight.status).toBe(204);
      expect(preflight.headers['access-control-allow-origin']).toBe(origin);
    }
  });

  it('omits Access-Control-Allow-Origin for disallowed origins', async () => {
    const res = await request(app)
      .options('/api/v1/auth/google/nonce')
      .set('Origin', 'https://evil.example.com')
      .set('Access-Control-Request-Method', 'POST');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('enforces environment boundaries on preview/stage origins', async () => {
    expect(isAllowedOrigin('https://rohangautam.dev')).toBe(true);
    expect(isAllowedOrigin('https://rohan-admin-panel.pages.dev')).toBe(true);
    // Running in NODE_ENV=test allows stage and Cloudflare preview origins
    expect(isAllowedOrigin('https://stage.rohangautam.dev')).toBe(true);
    expect(isAllowedOrigin('https://pr-56.rohan-admin-panel.pages.dev')).toBe(true);
    expect(isAllowedOrigin('https://evil.example.com')).toBe(false);

    const prevNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    vi.resetModules();
    try {
      const prodConstants = await import('../src/utils/constant');
      expect(prodConstants.isAllowedOrigin('https://rohangautam.dev')).toBe(true);
      expect(prodConstants.isAllowedOrigin('https://rohan-admin-panel.pages.dev')).toBe(true);
      expect(prodConstants.isAllowedOrigin('https://stage.rohangautam.dev')).toBe(false);
      expect(prodConstants.isAllowedOrigin('https://pr-56.rohan-admin-panel.pages.dev')).toBe(
        false
      );
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
      vi.resetModules();
    }
  });

  it('still returns Access-Control-Allow-Origin when an allowed origin hits a 429 rate limit', async () => {
    const origin = 'https://rohangautam.dev';
    let lastStatus = 200;
    let lastCorsHeader: string | undefined;

    for (let i = 0; i <= GOOGLE_AUTH_MAX_REQUESTS; i += 1) {
      const res = await request(app).post('/api/v1/auth/google/nonce').set('Origin', origin);
      lastStatus = res.status;
      lastCorsHeader = res.headers['access-control-allow-origin'];
    }

    expect(lastStatus).toBe(429);
    expect(lastCorsHeader).toBe(origin);
  });
});
