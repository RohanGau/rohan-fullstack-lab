/**
 * Operator session lifecycle (refresh rotation, family revocation, logout),
 * through the real app over HTTP. Only the Google ID-token verifier is faked.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { buildTestApp } from './helpers/app';
import { clearTestDb, startTestDb, stopTestDb } from './helpers/db';
import { bootstrapAccessControl } from '../src/services/accessControlBootstrap';
import { verifyGoogleIdToken } from '../src/services/googleIdToken';

vi.mock('../src/services/googleIdToken', () => ({ verifyGoogleIdToken: vi.fn() }));
const fakeVerify = vi.mocked(verifyGoogleIdToken);

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL as string;
const app = buildTestApp();

type Tokens = { accessToken: string; refreshToken: string };

/** A full Operator sign-in: nonce, Google (faked), tokens. Each call is a new session. */
async function signIn(): Promise<Tokens> {
  const nonceRes = await request(app).post('/api/v1/auth/google/nonce');
  const nonce = nonceRes.body.nonce as string;
  fakeVerify.mockResolvedValue({
    sub: 'google-sub-owner',
    email: SUPER_ADMIN_EMAIL,
    emailVerified: true,
    nonce,
  });
  const res = await request(app).post('/api/v1/auth/google').send({ idToken: 'fake', nonce });
  expect(res.status).toBe(200);
  return res.body as Tokens;
}

const refresh = (refreshToken: string) =>
  request(app).post('/api/v1/auth/refresh').send({ refreshToken });
const logout = (refreshToken: string) =>
  request(app).post('/api/v1/auth/logout').send({ refreshToken });

beforeAll(async () => {
  await startTestDb();
}, 60000);

beforeEach(async () => {
  await clearTestDb();
  await bootstrapAccessControl();
  fakeVerify.mockReset();
});

afterAll(async () => {
  await stopTestDb();
});

describe('POST /api/v1/auth/refresh', () => {
  it('returns a new token pair that works, and the presented refresh token cannot be used again', async () => {
    const first = await signIn();

    const rotated = await refresh(first.refreshToken);

    expect(rotated.status).toBe(200);
    expect(rotated.body.refreshToken).not.toBe(first.refreshToken);
    const me = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${rotated.body.accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(SUPER_ADMIN_EMAIL);
    expect((await refresh(first.refreshToken)).status).toBe(401);
  });

  it('refuses a reused rotated token and revokes every token in that session family', async () => {
    const first = await signIn();
    const rotated = await refresh(first.refreshToken);
    expect(rotated.status).toBe(200);

    const reuse = await refresh(first.refreshToken);
    const latest = await refresh(rotated.body.refreshToken);

    expect(reuse.status).toBe(401);
    expect(latest.status).toBe(401);
  });

  it('lets exactly one of two simultaneous refreshes with the same token succeed', async () => {
    const session = await signIn();

    const [a, b] = await Promise.all([
      refresh(session.refreshToken),
      refresh(session.refreshToken),
    ]);

    expect([a.status, b.status].sort()).toEqual([200, 401]);
  });

  it('keeps independent sign-ins independent: revoking one session does not affect another', async () => {
    const sessionA = await signIn();
    const sessionB = await signIn();

    const rotatedA = await refresh(sessionA.refreshToken);
    expect(rotatedA.status).toBe(200);
    expect((await refresh(sessionA.refreshToken)).status).toBe(401); // reuse revokes A only

    expect((await refresh(sessionB.refreshToken)).status).toBe(200);
  });

  it('refuses a refresh token that is not a valid token at all', async () => {
    const res = await refresh('this-is-long-enough-but-is-not-a-signed-token');

    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('ends the session on the server: refreshing afterwards is refused', async () => {
    const session = await signIn();

    const out = await logout(session.refreshToken);

    expect(out.status).toBe(204);
    expect((await refresh(session.refreshToken)).status).toBe(401);
  });

  it('ends the whole session even when the latest token has rotated since', async () => {
    const first = await signIn();
    const rotated = await refresh(first.refreshToken);

    await logout(first.refreshToken);

    expect((await refresh(rotated.body.refreshToken)).status).toBe(401);
  });

  it('leaves other sessions signed in', async () => {
    const sessionA = await signIn();
    const sessionB = await signIn();

    await logout(sessionA.refreshToken);

    expect((await refresh(sessionB.refreshToken)).status).toBe(200);
  });
});
