/**
 * Managing Roles and assigning them to Operators, through the real app over HTTP.
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
const ROLES = '/api/v1/roles';
const OPERATORS = '/api/v1/operators';
const BOOTSTRAP_EMAIL = process.env.SUPER_ADMIN_EMAIL as string;

const listRoles = (token: string) => request(app).get(ROLES).set(bearer(token));
const createRole = (token: string, body: object) =>
  request(app).post(ROLES).set(bearer(token)).send(body);
const editRole = (token: string, id: string, body: object) =>
  request(app).put(`${ROLES}/${id}`).set(bearer(token)).send(body);
const deleteRole = (token: string, id: string) =>
  request(app).delete(`${ROLES}/${id}`).set(bearer(token));
const assign = (token: string, operatorId: string, roles: string[]) =>
  request(app).put(`${OPERATORS}/${operatorId}/roles`).set(bearer(token)).send({ roles });
const roleId = async (name: string) => (await Role.findOne({ name }))!.id as string;

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

describe('GET /api/v1/roles', () => {
  it('lists the seeded Roles for an Admin, with which are protected and what they hold', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);

    const res = await listRoles(token);

    expect(res.status).toBe(200);
    expect(res.headers['x-total-count']).toBe('5');
    const byName = Object.fromEntries(res.body.map((r: { name: string }) => [r.name, r]));
    expect(Object.keys(byName).sort()).toEqual([
      'admin',
      'content_manager',
      'inbox_manager',
      'super_admin',
      'viewer',
    ]);
    expect(byName.super_admin).toMatchObject({ isProtected: true, permissions: [] });
    expect(byName.admin.isProtected).toBe(true);
    expect([...byName.admin.permissions].sort()).toEqual([...PERMISSION_VALUES].sort());
    expect(byName.viewer).toMatchObject({
      isProtected: false,
      permissions: ['contact:read', 'slot:read'],
    });
  });

  it('refuses no token with 401 and non-managing Roles with 403', async () => {
    expect((await request(app).get(ROLES)).status).toBe(401);
    for (const role of ['content_manager', 'inbox_manager', 'viewer']) {
      const { token } = await operatorWithToken(`${role}@example.com`, [role]);
      expect((await listRoles(token)).status).toBe(403);
    }
  });
});

describe('POST /api/v1/roles', () => {
  it('lets an Admin create a Role from catalogue Permissions, which is never protected', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);

    const res = await createRole(token, {
      name: 'support_agent',
      permissions: ['contact:read', 'slot:read'],
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'support_agent',
      isProtected: false,
      permissions: ['contact:read', 'slot:read'],
    });
    const names = (await listRoles(token)).body.map((r: { name: string }) => r.name);
    expect(names).toContain('support_agent');
  });

  it('refuses a Permission that is not in the catalogue, naming the field', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);

    const res = await createRole(token, { name: 'sneaky', permissions: ['blog:fly'] });

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual([
      { field: 'permissions', message: 'Unknown permission: blog:fly' },
    ]);
    expect(await Role.countDocuments({ name: 'sneaky' })).toBe(0);
  });

  it('refuses a name that is not lower-case words joined by underscores', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);

    const res = await createRole(token, { name: 'Not Valid!', permissions: [] });

    expect(res.status).toBe(400);
    expect(res.body.error[0].field).toBe('name');
  });

  it('refuses a name that is already taken with 409, including the protected ones', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);

    expect((await createRole(token, { name: 'viewer', permissions: [] })).status).toBe(409);
    expect((await createRole(token, { name: 'super_admin', permissions: [] })).status).toBe(409);
  });

  it('refuses non-managing Roles with 403', async () => {
    const { token } = await operatorWithToken('viewer@example.com', ['viewer']);

    expect((await createRole(token, { name: 'x_role', permissions: [] })).status).toBe(403);
  });
});

describe('PUT /api/v1/roles/:id', () => {
  it('lets an Admin change a Role, taking effect for its holders without signing in again', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);
    await createRole(token, { name: 'support_agent', permissions: ['contact:read'] });
    const holder = await operatorWithToken('holder@example.com', ['support_agent']);
    const before = await request(app).get('/api/v1/auth/me').set(bearer(holder.token));
    expect(before.body.permissions).toEqual(['contact:read']);

    const res = await editRole(token, await roleId('support_agent'), {
      permissions: ['contact:read', 'slot:read'],
    });

    expect(res.status).toBe(200);
    const after = await request(app).get('/api/v1/auth/me').set(bearer(holder.token));
    expect([...after.body.permissions].sort()).toEqual(['contact:read', 'slot:read']);
  });

  it('can rename a Role that is not protected, but not to a name already taken', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);
    await createRole(token, { name: 'support_agent', permissions: [] });
    const id = await roleId('support_agent');

    expect((await editRole(token, id, { name: 'helpdesk' })).body.name).toBe('helpdesk');
    expect((await editRole(token, id, { name: 'viewer' })).status).toBe(409);
  });

  it('refuses a Permission that is not in the catalogue', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);

    const res = await editRole(token, await roleId('viewer'), { permissions: ['nope:nope'] });

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual([
      { field: 'permissions', message: 'Unknown permission: nope:nope' },
    ]);
  });

  it('never lets an Admin edit a protected Role', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);

    for (const name of ['admin', 'super_admin']) {
      const res = await editRole(token, await roleId(name), { permissions: [] });
      expect(res.status).toBe(403);
    }
    expect((await Role.findOne({ name: 'admin' }))!.permissions).toHaveLength(
      PERMISSION_VALUES.length
    );
  });

  it('lets a Super Admin edit the admin Role, but nobody edit super_admin', async () => {
    const { token } = await operatorWithToken('boss@example.com', ['super_admin']);

    const edited = await editRole(token, await roleId('admin'), {
      permissions: ['contact:read'],
    });
    const forbidden = await editRole(token, await roleId('super_admin'), {
      permissions: ['contact:read'],
    });

    expect(edited.status).toBe(200);
    expect(edited.body.permissions).toEqual(['contact:read']);
    expect(forbidden.status).toBe(403);
  });

  it('does not let a protected Role be renamed', async () => {
    const { token } = await operatorWithToken('boss@example.com', ['super_admin']);

    const res = await editRole(token, await roleId('admin'), { name: 'boss_two' });

    expect(res.status).toBe(400);
    expect(res.body.error[0].field).toBe('name');
  });

  it('answers 404 for a Role that does not exist', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);

    expect((await editRole(token, '64b64b64b64b64b64b64b64b', { permissions: [] })).status).toBe(
      404
    );
    expect((await editRole(token, 'not-an-id', { permissions: [] })).status).toBe(404);
  });

  it('refuses non-managing Roles with 403', async () => {
    const { token } = await operatorWithToken('viewer@example.com', ['viewer']);

    expect((await editRole(token, await roleId('viewer'), { permissions: [] })).status).toBe(403);
  });
});

describe('DELETE /api/v1/roles/:id', () => {
  it('deletes a Role nobody holds', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);
    await createRole(token, { name: 'support_agent', permissions: [] });

    const res = await deleteRole(token, await roleId('support_agent'));

    expect(res.status).toBe(204);
    expect(await Role.countDocuments({ name: 'support_agent' })).toBe(0);
  });

  it('refuses to delete a Role an Operator still holds, until they are given another', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);
    await createRole(token, { name: 'support_agent', permissions: [] });
    const holder = await createOperator('holder@example.com', ['support_agent']);
    const id = await roleId('support_agent');

    const refused = await deleteRole(token, id);
    expect(refused.status).toBe(409);
    expect(refused.body.message).toMatch(/still assigned/i);

    await assign(token, holder.id, ['viewer']);
    expect((await deleteRole(token, id)).status).toBe(204);
  });

  it('never deletes a protected Role, whoever asks', async () => {
    const admin = await operatorWithToken('admin@example.com', ['admin']);
    const boss = await operatorWithToken('boss@example.com', ['super_admin']);

    for (const name of ['admin', 'super_admin']) {
      expect((await deleteRole(admin.token, await roleId(name))).status).toBe(403);
      expect((await deleteRole(boss.token, await roleId(name))).status).toBe(403);
      expect(await Role.countDocuments({ name })).toBe(1);
    }
  });

  it('answers 404 for a Role that does not exist, and 403 for non-managing Roles', async () => {
    const admin = await operatorWithToken('admin@example.com', ['admin']);
    const viewer = await operatorWithToken('viewer@example.com', ['viewer']);

    expect((await deleteRole(admin.token, '64b64b64b64b64b64b64b64b')).status).toBe(404);
    expect((await deleteRole(viewer.token, await roleId('viewer'))).status).toBe(403);
  });
});

describe('PUT /api/v1/operators/:id/roles', () => {
  it('lets an Admin change an Operator’s Roles among those that are not protected', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);
    const target = await createOperator('target@example.com', ['viewer']);

    const res = await assign(token, target.id, ['content_manager', 'inbox_manager']);

    expect(res.status).toBe(200);
    expect([...res.body.roles].sort()).toEqual(['content_manager', 'inbox_manager']);
  });

  it('takes effect for the Operator without signing in again', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);
    const target = await operatorWithToken('target@example.com', ['viewer']);

    await assign(token, target.operator.id, ['content_manager']);

    const me = await request(app).get('/api/v1/auth/me').set(bearer(target.token));
    expect(me.body.roles).toEqual(['content_manager']);
  });

  it.each(['admin', 'super_admin'])('refuses an Admin granting %s', async (role) => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);
    const target = await createOperator('target@example.com', ['viewer']);

    const res = await assign(token, target.id, ['viewer', role]);

    expect(res.status).toBe(403);
    expect((await Operator.findById(target.id).populate('roles'))!.roles).toHaveLength(1);
  });

  it('lets a Super Admin grant admin and super_admin', async () => {
    const { token } = await operatorWithToken('boss@example.com', ['super_admin']);
    const target = await createOperator('target@example.com');

    expect((await assign(token, target.id, ['admin'])).body.roles).toEqual(['admin']);
    expect((await assign(token, target.id, ['super_admin'])).body.roles).toEqual(['super_admin']);
  });

  it('refuses an Admin removing the admin Role from an Admin, but lets a Super Admin', async () => {
    const admin = await operatorWithToken('admin@example.com', ['admin']);
    const boss = await operatorWithToken('boss@example.com', ['super_admin']);
    const otherAdmin = await createOperator('other@example.com', ['admin']);

    expect((await assign(admin.token, otherAdmin.id, [])).status).toBe(403);
    expect((await assign(boss.token, otherAdmin.id, [])).status).toBe(200);
  });

  it('never lets an Admin change a Super Admin’s Roles, even to Roles that are not protected', async () => {
    const admin = await operatorWithToken('admin@example.com', ['admin']);
    const boss = await createOperator('boss@example.com', ['super_admin']);

    const res = await assign(admin.token, boss.id, ['super_admin', 'viewer']);

    expect(res.status).toBe(403);
  });

  it('never lets the bootstrap Super Admin lose super_admin, even at a Super Admin’s hand', async () => {
    const { token } = await operatorWithToken('boss@example.com', ['super_admin']);
    const bootstrap = await Operator.findOne({ email: BOOTSTRAP_EMAIL });

    const res = await assign(token, bootstrap!.id, ['viewer']);

    expect(res.status).toBe(403);
    const after = await Operator.findById(bootstrap!.id).populate<{ roles: { name: string }[] }>(
      'roles'
    );
    expect(after!.roles.map((r) => r.name)).toContain('super_admin');
  });

  it('refuses a Role that does not exist, naming the field', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);
    const target = await createOperator('target@example.com');

    const res = await assign(token, target.id, ['nonsense']);

    expect(res.status).toBe(400);
    expect(res.body.error).toEqual([{ field: 'roles', message: 'Unknown role: nonsense' }]);
  });

  it('answers 404 for an Operator that does not exist', async () => {
    const { token } = await operatorWithToken('admin@example.com', ['admin']);

    expect((await assign(token, '64b64b64b64b64b64b64b64b', ['viewer'])).status).toBe(404);
    expect((await assign(token, 'not-an-id', ['viewer'])).status).toBe(404);
  });

  it('refuses non-managing Roles with 403 and no token with 401', async () => {
    const target = await createOperator('target@example.com');
    for (const role of ['content_manager', 'inbox_manager', 'viewer']) {
      const { token } = await operatorWithToken(`${role}@example.com`, [role]);
      expect((await assign(token, target.id, ['viewer'])).status).toBe(403);
    }
    const noToken = await request(app).put(`${OPERATORS}/${target.id}/roles`).send({ roles: [] });
    expect(noToken.status).toBe(401);
  });
});
