/**
 * Operator sign-in with Google, through the real app over HTTP.
 * Only the Google ID-token verifier is faked (the one external boundary).
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

async function getNonce(): Promise<string> {
  const res = await request(app).post('/api/v1/auth/google/nonce');
  return res.body.nonce as string;
}

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

describe('POST /api/v1/auth/google/nonce', () => {
  it('issues a fresh nonce on every request', async () => {
    const first = await request(app).post('/api/v1/auth/google/nonce');
    const second = await request(app).post('/api/v1/auth/google/nonce');

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(typeof first.body.nonce).toBe('string');
    expect(first.body.nonce.length).toBeGreaterThanOrEqual(16);
    expect(second.body.nonce).not.toBe(first.body.nonce);
  });
});

describe('POST /api/v1/auth/google', () => {
  it('signs in the bootstrap Super Admin and issues tokens that identify them', async () => {
    const nonce = await getNonce();
    fakeVerify.mockResolvedValue({
      sub: 'google-sub-owner',
      email: SUPER_ADMIN_EMAIL,
      emailVerified: true,
      nonce,
    });

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'fake-google-id-token', nonce });

    expect(res.status).toBe(200);
    expect(res.body.tokenType).toBe('Bearer');
    expect(typeof res.body.accessToken).toBe('string');
    expect(typeof res.body.refreshToken).toBe('string');

    const me = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${res.body.accessToken}`);

    expect(me.status).toBe(200);
    expect(me.body.email).toBe(SUPER_ADMIN_EMAIL);
  });

  it('resolves the Super Admin to their Role and the whole Permission catalogue', async () => {
    const nonce = await getNonce();
    fakeVerify.mockResolvedValue({
      sub: 'google-sub-owner',
      email: SUPER_ADMIN_EMAIL,
      emailVerified: true,
      nonce,
    });
    const signedIn = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'fake-google-id-token', nonce });

    const me = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${signedIn.body.accessToken}`);

    expect(me.status).toBe(200);
    expect(me.body.roles).toEqual(['super_admin']);
    expect([...me.body.permissions].sort()).toEqual(
      [
        'agent:use',
        'blog:create',
        'blog:delete',
        'blog:update',
        'contact:delete',
        'contact:read',
        'diagnostics:run',
        'operator:assign-role',
        'operator:create',
        'operator:deactivate',
        'operator:read',
        'profile:create',
        'profile:delete',
        'profile:update',
        'project:create',
        'project:delete',
        'project:update',
        'role:manage',
        'slot:delete',
        'slot:read',
        'slot:update',
        'upload:create',
        'upload:delete',
      ].sort()
    );
  });

  it('binds the first Google account to the Operator and refuses any other account using that email', async () => {
    const signIn = async (sub: string) => {
      const nonce = await getNonce();
      fakeVerify.mockResolvedValue({ sub, email: SUPER_ADMIN_EMAIL, emailVerified: true, nonce });
      return request(app)
        .post('/api/v1/auth/google')
        .send({ idToken: 'fake-google-id-token', nonce });
    };

    const first = await signIn('google-sub-owner');
    const impostor = await signIn('google-sub-impostor');
    const ownerAgain = await signIn('google-sub-owner');

    expect(first.status).toBe(200);
    expect(impostor.status).toBe(401);
    expect(impostor.body.accessToken).toBeUndefined();
    expect(ownerAgain.status).toBe(200);
  });

  it('refuses a nonce that has already been used', async () => {
    const nonce = await getNonce();
    fakeVerify.mockResolvedValue({
      sub: 'google-sub-owner',
      email: SUPER_ADMIN_EMAIL,
      emailVerified: true,
      nonce,
    });
    const body = { idToken: 'fake-google-id-token', nonce };

    const first = await request(app).post('/api/v1/auth/google').send(body);
    const replay = await request(app).post('/api/v1/auth/google').send(body);

    expect(first.status).toBe(200);
    expect(replay.status).toBe(401);
    expect(replay.body.accessToken).toBeUndefined();
  });

  it('refuses a Google token that was issued for a different nonce', async () => {
    const issuedNonce = await getNonce();
    fakeVerify.mockResolvedValue({
      sub: 'google-sub-owner',
      email: SUPER_ADMIN_EMAIL,
      emailVerified: true,
      nonce: 'a-nonce-from-some-other-login',
    });

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'fake-google-id-token', nonce: issuedNonce });

    expect(res.status).toBe(401);
    expect(res.body.accessToken).toBeUndefined();
  });

  it('refuses a Google account whose email is not verified', async () => {
    const nonce = await getNonce();
    fakeVerify.mockResolvedValue({
      sub: 'google-sub-owner',
      email: SUPER_ADMIN_EMAIL,
      emailVerified: false,
      nonce,
    });

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'fake-google-id-token', nonce });

    expect(res.status).toBe(401);
    expect(res.body.accessToken).toBeUndefined();
  });

  it('refuses a verified Google account that is not a registered Operator', async () => {
    const nonce = await getNonce();
    fakeVerify.mockResolvedValue({
      sub: 'google-sub-stranger',
      email: 'stranger@example.com',
      emailVerified: true,
      nonce,
    });

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'fake-google-id-token', nonce });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Sign-in refused' });
  });

  it('refuses a token Google itself rejects (wrong audience, expired, bad signature)', async () => {
    const nonce = await getNonce();
    fakeVerify.mockRejectedValue(
      new Error('Wrong recipient, payload audience != requiredAudience')
    );

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'fake-google-id-token', nonce });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Sign-in refused' });
  });

  it('refuses a nonce the API never issued', async () => {
    fakeVerify.mockResolvedValue({
      sub: 'google-sub-owner',
      email: SUPER_ADMIN_EMAIL,
      emailVerified: true,
      nonce: 'forged-nonce-value-0123456789',
    });

    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({ idToken: 'fake-google-id-token', nonce: 'forged-nonce-value-0123456789' });

    expect(res.status).toBe(401);
  });
});
