/**
 * The seeded Roles and the Permission guard, through the real app over HTTP.
 * Operators are created directly (as an administrator would) and given the access
 * token a sign-in would have produced.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { PERMISSION_VALUES } from '@fullstack-lab/constants';
import { buildTestApp } from './helpers/app';
import { clearTestDb, startTestDb, stopTestDb } from './helpers/db';
import { bearer, createOperator, operatorWithToken } from './helpers/operators';
import Operator from '../src/models/Operator';
import Role from '../src/models/Role';
import { bootstrapAccessControl } from '../src/services/accessControlBootstrap';

const app = buildTestApp();
const OPERATORS = '/api/v1/operators';

beforeAll(async () => {
  await startTestDb();
}, 60000);
beforeEach(async () => {
  await clearTestDb();
  await bootstrapAccessControl();
});
afterAll(async () => {
  await stopTestDb();
});

describe('the seeded Roles', () => {
  const EXPECTED: Record<string, string[]> = {
    content_manager: [
      'blog:create',
      'blog:update',
      'blog:delete',
      'project:create',
      'project:update',
      'project:delete',
      'profile:create',
      'profile:update',
      'profile:delete',
      'upload:create',
      'upload:delete',
    ],
    inbox_manager: ['contact:read', 'contact:delete', 'slot:read', 'slot:update', 'slot:delete'],
    viewer: ['contact:read', 'slot:read'],
  };

  it.each(Object.keys(EXPECTED))('gives %s exactly its Permissions', async (role) => {
    const { token } = await operatorWithToken(`${role}@example.com`, [role]);

    const me = await request(app).get('/api/v1/auth/me').set(bearer(token));

    expect(me.body.roles).toEqual([role]);
    expect([...me.body.permissions].sort()).toEqual([...EXPECTED[role]!].sort());
  });

  it.each(['super_admin', 'admin'])('gives %s the whole Permission catalogue', async (role) => {
    const { token } = await operatorWithToken(`${role}@example.com`, [role]);

    const me = await request(app).get('/api/v1/auth/me').set(bearer(token));

    expect([...me.body.permissions].sort()).toEqual([...PERMISSION_VALUES].sort());
  });

  it('does not reset a Role that an administrator has edited when the API boots again', async () => {
    await Role.updateOne({ name: 'viewer' }, { permissions: ['contact:read'] });
    const { token } = await operatorWithToken('viewer@example.com', ['viewer']);

    await bootstrapAccessControl();

    const me = await request(app).get('/api/v1/auth/me').set(bearer(token));
    expect(me.body.permissions).toEqual(['contact:read']);
  });
});

describe('GET /api/v1/operators', () => {
  it('refuses a request with no token or a bad one with 401', async () => {
    expect((await request(app).get(OPERATORS)).status).toBe(401);
    expect((await request(app).get(OPERATORS).set(bearer('not-a-token'))).status).toBe(401);
  });

  it('refuses the static admin token: it is not an Operator', async () => {
    const res = await request(app)
      .get(OPERATORS)
      .set(bearer(process.env.ADMIN_TOKEN as string));

    expect(res.status).toBe(403);
  });

  it.each(['content_manager', 'inbox_manager', 'viewer'])('refuses %s with 403', async (role) => {
    const { token } = await operatorWithToken(`${role}@example.com`, [role]);

    expect((await request(app).get(OPERATORS).set(bearer(token))).status).toBe(403);
  });

  it.each(['admin', 'super_admin'])('lets %s list the Operators', async (role) => {
    const { token } = await operatorWithToken(`${role}@example.com`, [role]);
    await createOperator('viewer@example.com', ['viewer']);

    const res = await request(app).get(OPERATORS).set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.headers['x-total-count']).toBe('3'); // bootstrap, this Operator, the viewer
    const viewer = res.body.find((o: { email: string }) => o.email === 'viewer@example.com');
    expect(viewer).toEqual({
      id: expect.any(String),
      email: 'viewer@example.com',
      roles: ['viewer'],
      active: true,
      isBootstrap: false,
      hasSignedIn: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(res.body.map((o: Record<string, unknown>) => Object.keys(o)).flat()).not.toContain(
      'googleSub'
    );
  });

  it('pages and sorts like every other list', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);
    for (const name of ['b', 'c', 'd']) await createOperator(`${name}@example.com`);

    const res = await request(app)
      .get(OPERATORS)
      .query({ range: '[1,2]', sort: '["email","ASC"]' })
      .set(bearer(token));

    expect(res.body.map((o: { email: string }) => o.email)).toEqual([
      'b@example.com',
      'c@example.com',
    ]);
    expect(res.headers['x-total-count']).toBe('5'); // the bootstrap Operator, the admin, b, c, d
  });

  it('uses Permissions as they are now, not as they were when the token was issued', async () => {
    const { token } = await operatorWithToken('viewer@example.com', ['viewer']);
    expect((await request(app).get(OPERATORS).set(bearer(token))).status).toBe(403);

    await Role.updateOne({ name: 'viewer' }, { $addToSet: { permissions: 'operator:read' } });

    expect((await request(app).get(OPERATORS).set(bearer(token))).status).toBe(200);
  });

  it('refuses a deactivated Operator at once, even with a token that has not expired', async () => {
    const { operator, token } = await operatorWithToken('admin@example.com', ['admin']);
    expect((await request(app).get(OPERATORS).set(bearer(token))).status).toBe(200);

    await Operator.updateOne({ _id: operator._id }, { active: false });

    expect((await request(app).get(OPERATORS).set(bearer(token))).status).toBe(403);
  });
});
