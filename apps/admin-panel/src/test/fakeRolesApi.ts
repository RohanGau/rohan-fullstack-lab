import { API_PATHS, PERMISSIONS, PERMISSION_VALUES, SEEDED_ROLES } from '@fullstack-lab/constants';
import type { IRoleDto, Jsonified } from '@fullstack-lab/types';
import { http, HttpResponse } from 'msw';
import { API_URL, server } from './server';

export type RoleDtoRow = Jsonified<IRoleDto>;

const VALID_NAME_RE = /^[a-z][a-z0-9_]{1,39}$/;

export interface FakeRoleSeed extends RoleDtoRow {
  assignedCount?: number;
}

export function makeFullRoles(): FakeRoleSeed[] {
  return [
    {
      id: 'role-super-admin',
      name: SEEDED_ROLES.SUPER_ADMIN,
      isProtected: true,
      permissions: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'role-admin',
      name: SEEDED_ROLES.ADMIN,
      isProtected: true,
      permissions: [PERMISSIONS.BLOG_CREATE, PERMISSIONS.CONTACT_READ, PERMISSIONS.OPERATOR_READ],
      createdAt: '2025-01-02T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    },
    {
      id: 'role-editor',
      name: 'blog_editor',
      isProtected: false,
      assignedCount: 0,
      permissions: [PERMISSIONS.BLOG_CREATE, PERMISSIONS.BLOG_UPDATE],
      createdAt: '2025-01-03T00:00:00.000Z',
      updatedAt: '2025-01-03T00:00:00.000Z',
    },
    {
      id: 'role-in-use',
      name: 'support_agent',
      isProtected: false,
      assignedCount: 2,
      permissions: [PERMISSIONS.CONTACT_READ, PERMISSIONS.SLOT_READ],
      createdAt: '2025-01-04T00:00:00.000Z',
      updatedAt: '2025-01-04T00:00:00.000Z',
    },
  ];
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  return header?.startsWith('Bearer ') ? header.slice(7) : null;
}

export function fakeRolesApi(
  initial: FakeRoleSeed[] = makeFullRoles(),
  auth?: { acceptsAccessToken(token: string): boolean; currentRoles?: () => string[] }
) {
  let rows = initial.map((r) => ({ ...r, permissions: [...r.permissions] }));
  let nextId = 100;
  let forceNextServerErrorOnCreate: {
    msg: string;
    error: { field: string; message: string }[];
  } | null = null;

  function authorize(request: Request): Response | null {
    const token = bearerToken(request);
    if (!auth) return null;
    if (!token || !auth.acceptsAccessToken(token)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return null;
  }

  function toPublic(seed: FakeRoleSeed): RoleDtoRow {
    return {
      id: seed.id,
      name: seed.name,
      permissions: seed.permissions,
      isProtected: seed.isProtected,
      createdAt: seed.createdAt,
      updatedAt: seed.updatedAt,
    };
  }

  server.use(
    http.get(`${API_URL}${API_PATHS.ROLES}`, ({ request }) => {
      const denied = authorize(request);
      if (denied) return denied;

      const url = new URL(request.url);
      const filter = JSON.parse(url.searchParams.get('filter') ?? '{}') as Record<string, unknown>;
      const sort = JSON.parse(url.searchParams.get('sort') ?? '["name","ASC"]') as [
        string,
        'ASC' | 'DESC',
      ];
      const range = JSON.parse(url.searchParams.get('range') ?? '[0,24]') as [number, number];

      let matching = rows.filter((row) => {
        if (typeof filter.name === 'string' && !row.name.includes(filter.name)) return false;
        if (typeof filter.isProtected === 'boolean' && row.isProtected !== filter.isProtected) {
          return false;
        }
        return true;
      });

      const [sortField, sortDir] = sort;
      matching = [...matching].sort((a, b) => {
        const av = String((a as Record<string, unknown>)[sortField] ?? '');
        const bv = String((b as Record<string, unknown>)[sortField] ?? '');
        const cmp = av.localeCompare(bv);
        return sortDir === 'DESC' ? -cmp : cmp;
      });

      const [from, to] = range;
      const pageRows = matching.slice(from, to + 1).map(toPublic);
      return HttpResponse.json(pageRows, {
        headers: { 'X-Total-Count': String(matching.length) },
      });
    }),

    http.post(`${API_URL}${API_PATHS.ROLES}`, async ({ request }) => {
      const denied = authorize(request);
      if (denied) return denied;

      if (forceNextServerErrorOnCreate) {
        const err = forceNextServerErrorOnCreate;
        forceNextServerErrorOnCreate = null;
        return HttpResponse.json(err, { status: 400 });
      }

      const body = (await request.json()) as { name?: string; permissions?: string[] };
      const name = (body.name ?? '').trim();
      const permissions = body.permissions ?? [];

      if (!VALID_NAME_RE.test(name)) {
        return HttpResponse.json(
          {
            msg: 'Invalid request body',
            error: [{ field: 'name', message: 'Invalid role name format' }],
          },
          { status: 400 }
        );
      }

      const catalogue = new Set<string>(PERMISSION_VALUES);
      if (permissions.some((p) => !catalogue.has(p))) {
        return HttpResponse.json(
          {
            msg: 'Invalid request body',
            error: [{ field: 'permissions', message: 'Unknown permission' }],
          },
          { status: 400 }
        );
      }

      if (rows.some((r) => r.name === name)) {
        return HttpResponse.json(
          { message: 'A Role with this name already exists' },
          { status: 409 }
        );
      }

      nextId += 1;
      const now = new Date().toISOString();
      const created: FakeRoleSeed = {
        id: `role-${nextId}`,
        name,
        permissions: [...permissions],
        isProtected: false,
        assignedCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      rows = [created, ...rows];
      return HttpResponse.json(toPublic(created), { status: 201 });
    }),

    http.put(`${API_URL}${API_PATHS.ROLES}/:id`, async ({ request, params }) => {
      const denied = authorize(request);
      if (denied) return denied;

      const idx = rows.findIndex((r) => r.id === params.id);
      if (idx === -1) return HttpResponse.json({ message: 'Role not found' }, { status: 404 });
      const target = rows[idx]!;

      if (target.name === SEEDED_ROLES.SUPER_ADMIN) {
        return HttpResponse.json(
          { message: 'The super_admin Role cannot be changed' },
          { status: 403 }
        );
      }
      const roles = auth?.currentRoles?.() ?? [];
      if (target.isProtected && !roles.includes(SEEDED_ROLES.SUPER_ADMIN)) {
        return HttpResponse.json(
          { message: 'Only a Super Admin can change a protected Role' },
          { status: 403 }
        );
      }

      const body = (await request.json()) as { name?: string; permissions?: string[] };
      if (body.name && body.name !== target.name && target.isProtected) {
        return HttpResponse.json(
          { message: 'A protected Role cannot be renamed' },
          { status: 403 }
        );
      }

      const updated: FakeRoleSeed = {
        ...target,
        name: body.name ?? target.name,
        permissions: body.permissions ? [...body.permissions] : target.permissions,
        updatedAt: new Date().toISOString(),
      };
      rows[idx] = updated;
      return HttpResponse.json(toPublic(updated));
    }),

    http.delete(`${API_URL}${API_PATHS.ROLES}/:id`, ({ request, params }) => {
      const denied = authorize(request);
      if (denied) return denied;

      const target = rows.find((r) => r.id === params.id);
      if (!target) return HttpResponse.json({ message: 'Role not found' }, { status: 404 });

      if (target.isProtected) {
        return HttpResponse.json(
          { message: 'A protected Role cannot be deleted' },
          { status: 403 }
        );
      }

      if ((target.assignedCount ?? 0) > 0) {
        return HttpResponse.json(
          { message: `This Role is still assigned to ${target.assignedCount} Operator(s)` },
          { status: 409 }
        );
      }

      rows = rows.filter((r) => r.id !== target.id);
      return HttpResponse.json({ message: 'Role deleted' });
    })
  );

  return {
    getRows: () => rows.map(toPublic),
    failNextCreateValidation: (msg: string, error: { field: string; message: string }[]) => {
      forceNextServerErrorOnCreate = { msg, error };
    },
  };
}
