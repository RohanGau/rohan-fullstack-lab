/**
 * Startup configuration: the API must refuse to boot, with a clear message,
 * when the Operator sign-in configuration is incomplete. Built through the real app.
 */
import { describe, expect, it } from 'vitest';
import { buildTestApp } from './helpers/app';
import { REQUIRED_AUTH_ENV as REQUIRED } from '../src/config/authConfig';

describe('Operator sign-in configuration at startup', () => {
  it('starts when everything is configured', () => {
    expect(() => buildTestApp({ ...process.env })).not.toThrow();
  });

  it.each(REQUIRED)('refuses to start without %s, naming it', (name) => {
    const env = { ...process.env, [name]: undefined };

    expect(() => buildTestApp(env)).toThrow(name);
  });

  it.each(REQUIRED)('treats a blank %s as missing', (name) => {
    const env = { ...process.env, [name]: '   ' };

    expect(() => buildTestApp(env)).toThrow(name);
  });

  it('does not fall back to ADMIN_TOKEN for either signing secret', () => {
    const env = {
      ...process.env,
      ADMIN_TOKEN: 'a-static-admin-token-that-must-not-sign-anything',
      JWT_ACCESS_SECRET: undefined,
      JWT_REFRESH_SECRET: undefined,
    };

    expect(() => buildTestApp(env)).toThrow(/JWT_ACCESS_SECRET.*JWT_REFRESH_SECRET/s);
  });

  it('does not fall back from the refresh secret to the access secret', () => {
    const env = { ...process.env, JWT_REFRESH_SECRET: undefined };

    expect(() => buildTestApp(env)).toThrow('JWT_REFRESH_SECRET');
  });
});
