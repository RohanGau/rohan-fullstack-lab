/**
 * Pre-registering and deactivating Operators, through the real app over HTTP.
 * Only the Google ID-token verifier is faked.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { buildTestApp } from './helpers/app';
import { clearTestDb, startTestDb, stopTestDb } from './helpers/db';
import { bearer, createOperator, operatorWithToken } from './helpers/operators';
import Operator from '../src/models/Operator';
import Role from '../src/models/Role';
import { bootstrapAccessControl } from '../src/services/accessControlBootstrap';
import { verifyGoogleIdToken } from '../src/services/googleIdToken';

vi.mock('../src/services/googleIdToken', () => ({ verifyGoogleIdToken: vi.fn() }));
const fakeVerify = vi.mocked(verifyGoogleIdToken);

const app = buildTestApp();
const OPERATORS = '/api/v1/operators';
const BOOTSTRAP_EMAIL = process.env.SUPER_ADMIN_EMAIL as string;

async function googleSignIn(email: string, sub: string) {
  const { nonce } = (await request(app).post('/api/v1/auth/google/nonce')).body;
  fakeVerify.mockResolvedValue({ sub, email, emailVerified: true, nonce });
  return request(app).post('/api/v1/auth/google').send({ idToken: 'fake', nonce });
}

const register = (token: string, body: object) =>
  request(app).post(OPERATORS).set(bearer(token)).send(body);
const deactivate = (token: string, id: string) =>
  request(app).post(`${OPERATORS}/${id}/deactivate`).set(bearer(token));

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

describe('POST /api/v1/operators (pre-register)', () => {
  it('lets an Admin pre-register someone by email with no Roles', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);

    const res = await register(token, { email: '  New.Person@Example.com ' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: expect.any(String),
      email: 'new.person@example.com',
      roles: [],
      active: true,
      isBootstrap: false,
      hasSignedIn: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    const list = await request(app).get(OPERATORS).set(bearer(token));
    expect(list.body.map((o: { email: string }) => o.email)).toContain('new.person@example.com');
  });

  it('can give the new Operator an initial Role that is not protected', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);

    const res = await register(token, { email: 'cm@example.com', roles: ['content_manager'] });

    expect(res.status).toBe(201);
    expect(res.body.roles).toEqual(['content_manager']);
  });

  it('lets the pre-registered person sign in with Google, binding their account on first sign-in', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);
    await register(token, { email: 'new@example.com', roles: ['viewer'] });

    const signedIn = await googleSignIn('new@example.com', 'google-sub-new');

    expect(signedIn.status).toBe(200);
    const list = await request(app).get(OPERATORS).set(bearer(token));
    const created = list.body.find((o: { email: string }) => o.email === 'new@example.com');
    expect(created.hasSignedIn).toBe(true);
    const me = await request(app).get('/api/v1/auth/me').set(bearer(signedIn.body.accessToken));
    expect(me.body.roles).toEqual(['viewer']);
  });

  it('refuses an email that is not valid, naming the field', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);

    const res = await register(token, { email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual([{ field: 'email', message: expect.any(String) }]);
  });

  it('refuses a duplicate email, whatever its capitalisation, with 409', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);
    await register(token, { email: 'dup@example.com' });

    const res = await register(token, { email: 'DUP@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('refuses an initial Role that does not exist, naming the field', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);

    const res = await register(token, { email: 'x@example.com', roles: ['nonsense'] });

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual([{ field: 'roles', message: 'Unknown role: nonsense' }]);
  });

  it.each(['admin', 'super_admin'])(
    'refuses an Admin granting the protected Role %s',
    async (role) => {
      const { token } = await operatorWithToken('admin@example.com', ['admin']);

      const res = await register(token, { email: 'x@example.com', roles: [role] });

      expect(res.status).toBe(403);
      expect(await Operator.countDocuments({ email: 'x@example.com' })).toBe(0);
    }
  );

  it('lets a Super Admin grant a protected Role at registration', async () => {
    const { token } = await operatorWithToken('boss@example.com', ['super_admin']);

    const res = await register(token, { email: 'new-admin@example.com', roles: ['admin'] });

    expect(res.status).toBe(201);
    expect(res.body.roles).toEqual(['admin']);
  });

  it.each(['content_manager', 'inbox_manager', 'viewer'])('refuses %s with 403', async (role) => {
    const { token } = await operatorWithToken(`${role}@example.com`, [role]);

    expect((await register(token, { email: 'x@example.com' })).status).toBe(403);
  });

  it('needs the Permission to assign Roles as well, to register someone with a Role', async () => {
    await Role.create({ name: 'registrar', permissions: ['operator:create'] });
    const { token } = await operatorWithToken('registrar@example.com', ['registrar']);

    const withRole = await register(token, { email: 'a@example.com', roles: ['viewer'] });
    const withoutRole = await register(token, { email: 'b@example.com' });

    expect(withRole.status).toBe(403);
    expect(withoutRole.status).toBe(201);
  });

  it('refuses a request with no token with 401', async () => {
    expect((await request(app).post(OPERATORS).send({ email: 'x@example.com' })).status).toBe(401);
  });
});

describe('POST /api/v1/operators/:id/deactivate', () => {
  it('deactivates an Operator, who can then no longer sign in', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);
    const target = await createOperator('target@example.com', ['viewer']);
    expect((await googleSignIn('target@example.com', 'google-sub-target')).status).toBe(200);

    const res = await deactivate(token, target.id);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ email: 'target@example.com', active: false });
    expect((await googleSignIn('target@example.com', 'google-sub-target')).status).toBe(401);
  });

  it('ends their live sessions: a refresh afterwards is refused', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);
    const target = await createOperator('target@example.com', ['viewer']);
    const session = await googleSignIn('target@example.com', 'google-sub-target');

    await deactivate(token, target.id);

    const refreshed = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.body.refreshToken });
    expect(refreshed.status).toBe(401);
  });

  it('refuses a refresh for an Operator deactivated by any other means too', async () => {
    const target = await createOperator('target@example.com', ['viewer']);
    const session = await googleSignIn('target@example.com', 'google-sub-target');
    await Operator.updateOne({ _id: target._id }, { active: false });

    const refreshed = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.body.refreshToken });

    expect(refreshed.status).toBe(401);
  });

  it('is repeatable: deactivating someone already deactivated is not an error', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);
    const target = await createOperator('target@example.com');
    await deactivate(token, target.id);

    expect((await deactivate(token, target.id)).status).toBe(200);
  });

  it('never deactivates the bootstrap Super Admin, even for a Super Admin', async () => {
    const { token } = await operatorWithToken('boss@example.com', ['super_admin']);
    const bootstrap = await Operator.findOne({ email: BOOTSTRAP_EMAIL });

    const res = await deactivate(token, bootstrap!.id);

    expect(res.status).toBe(403);
    expect((await Operator.findById(bootstrap!.id))!.active).toBe(true);
  });

  it('does not let an Admin deactivate a Super Admin, but lets a Super Admin deactivate an Admin', async () => {
    const admin = await operatorWithToken('admin@example.com', ['admin']);
    const boss = await operatorWithToken('boss@example.com', ['super_admin']);

    expect((await deactivate(admin.token, boss.operator.id)).status).toBe(403);
    expect((await deactivate(boss.token, admin.operator.id)).status).toBe(200);
  });

  it('answers 404 for an Operator that does not exist or an id that is not one', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);

    expect((await deactivate(token, '64b64b64b64b64b64b64b64b')).status).toBe(404);
    expect((await deactivate(token, 'not-an-id')).status).toBe(404);
  });

  it.each(['content_manager', 'inbox_manager', 'viewer'])('refuses %s with 403', async (role) => {
    const { token } = await operatorWithToken(`${role}@example.com`, [role]);
    const target = await createOperator('target@example.com');

    expect((await deactivate(token, target.id)).status).toBe(403);
    expect((await Operator.findById(target.id))!.active).toBe(true);
  });
});
