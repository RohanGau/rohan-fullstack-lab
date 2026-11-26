import { API_PATHS, PROTECTED_ROLE_NAMES, SEEDED_ROLES } from '@fullstack-lab/constants';
import type { IOperatorDto, IRoleDto, Jsonified } from '@fullstack-lab/types';
import { http, HttpResponse } from 'msw';
import { API_URL, server } from './server';

export type OperatorRow = Jsonified<IOperatorDto>;

export function makeOperators(): OperatorRow[] {
  return [
    {
      id: 'op-bootstrap',
      email: 'bootstrap@example.com',
      roles: [SEEDED_ROLES.SUPER_ADMIN],
      active: true,
      isBootstrap: true,
      hasSignedIn: true,
      createdAt: '2025-01-01T12:00:00.000Z',
      updatedAt: '2025-01-01T12:00:00.000Z',
    },
    {
      id: 'op-admin',
      email: 'admin@example.com',
      roles: [SEEDED_ROLES.ADMIN],
      active: true,
      isBootstrap: false,
      hasSignedIn: true,
      createdAt: '2025-01-02T12:00:00.000Z',
      updatedAt: '2025-01-02T12:00:00.000Z',
    },
    {
      id: 'op-content',
      email: 'content@example.com',
      roles: [SEEDED_ROLES.CONTENT_MANAGER],
      active: true,
      isBootstrap: false,
      hasSignedIn: false,
      createdAt: '2025-01-03T12:00:00.000Z',
      updatedAt: '2025-01-03T12:00:00.000Z',
    },
    {
      id: 'op-viewer',
      email: 'viewer@example.com',
      roles: [SEEDED_ROLES.VIEWER],
      active: false,
      isBootstrap: false,
      hasSignedIn: false,
      createdAt: '2025-01-04T12:00:00.000Z',
      updatedAt: '2025-01-04T12:00:00.000Z',
    },
  ];
}

export function makeRoles(): IRoleDto[] {
  return [
    {
      id: 'role-1',
      name: SEEDED_ROLES.SUPER_ADMIN,
      isProtected: true,
      permissions: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'role-2',
      name: SEEDED_ROLES.ADMIN,
      isProtected: true,
      permissions: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'role-3',
      name: SEEDED_ROLES.CONTENT_MANAGER,
      isProtected: false,
      permissions: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'role-4',
      name: SEEDED_ROLES.INBOX_MANAGER,
      isProtected: false,
      permissions: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'role-5',
      name: SEEDED_ROLES.VIEWER,
      isProtected: false,
      permissions: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ];
}

export function fakeOperatorsApi(
  initial?: OperatorRow[],
  auth?: { acceptsAccessToken(token: string): boolean; currentRoles?: () => string[] },
  extraRoles: IRoleDto[] = []
) {
  const rows = initial ? [...initial] : makeOperators();
  const roles = [...makeRoles(), ...extraRoles];
  let listFailure: { status: number; remaining: number } | null = null;
  let deactivateFailure: { status: number; remaining: number } | null = null;
  let nextId = 100;

  const rejectsToken = (request: Request) =>
    auth !== undefined &&
    !auth.acceptsAccessToken(request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '');

  server.use(
    http.get(`${API_URL}${API_PATHS.ROLES}`, ({ request }) => {
      if (rejectsToken(request))
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      return HttpResponse.json(roles);
    }),

    http.get(`${API_URL}${API_PATHS.OPERATORS}`, ({ request }) => {
      if (rejectsToken(request))
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      if (listFailure && listFailure.remaining > 0) {
        listFailure.remaining -= 1;
        return HttpResponse.json({ error: 'FETCH_FAILED' }, { status: listFailure.status });
      }

      const url = new URL(request.url);
      const [from, to] = JSON.parse(url.searchParams.get('range') ?? '[0,24]') as [number, number];
      const [field, order] = JSON.parse(url.searchParams.get('sort') ?? '["createdAt","DESC"]') as [
        keyof OperatorRow,
        'ASC' | 'DESC',
      ];
      const filter = JSON.parse(url.searchParams.get('filter') ?? '{}') as Partial<OperatorRow>;

      const allowedFilter = ['email', 'active'];
      const allowedSort = ['createdAt', 'updatedAt', 'email'];
      const sortField = allowedSort.includes(field) ? field : 'createdAt';

      const matching = rows
        .filter((row) =>
          Object.entries(filter).every(
            ([k, v]) =>
              !allowedFilter.includes(k) || String(row[k as keyof OperatorRow]) === String(v)
          )
        )
        .sort(
          (a, b) =>
            String(a[sortField as keyof OperatorRow]).localeCompare(
              String(b[sortField as keyof OperatorRow])
            ) * (order === 'ASC' ? 1 : -1)
        );

      return HttpResponse.json(matching.slice(from, to + 1), {
        headers: { 'X-Total-Count': String(matching.length) },
      });
    }),

    http.post(`${API_URL}${API_PATHS.OPERATORS}`, async ({ request }) => {
      if (rejectsToken(request))
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });

      const body = (await request.json()) as { email: string; roles?: string[] };
      const callerRoles = auth?.currentRoles?.() ?? [SEEDED_ROLES.SUPER_ADMIN];
      const callerIsSuperAdmin = callerRoles.includes(SEEDED_ROLES.SUPER_ADMIN);

      if (rows.some((r) => r.email.toLowerCase() === body.email.toLowerCase())) {
        return HttpResponse.json(
          { message: 'An Operator with this email already exists' },
          { status: 409 }
        );
      }

      if (body.roles && body.roles.length > 0) {
        const containsProtected = body.roles.some((r) => PROTECTED_ROLE_NAMES.includes(r));
        if (containsProtected && !callerIsSuperAdmin) {
          return HttpResponse.json(
            { message: 'Only a Super Admin can grant a protected Role' },
            { status: 403 }
          );
        }
      }

      nextId += 1;
      const newOperator: OperatorRow = {
        id: `op-${nextId}`,
        email: body.email,
        roles: body.roles ?? [],
        active: true,
        isBootstrap: false,
        hasSignedIn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      rows.unshift(newOperator);
      return HttpResponse.json(newOperator, { status: 201 });
    }),

    http.post(`${API_URL}${API_PATHS.OPERATORS}/:id/deactivate`, ({ request, params }) => {
      if (rejectsToken(request))
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      if (deactivateFailure && deactivateFailure.remaining > 0) {
        deactivateFailure.remaining -= 1;
        return HttpResponse.json({ message: 'Server error' }, { status: deactivateFailure.status });
      }

      const operator = rows.find((r) => r.id === params.id);
      if (!operator) return HttpResponse.json({ message: 'Operator not found' }, { status: 404 });

      if (operator.isBootstrap) {
        return HttpResponse.json(
          { message: 'The bootstrap Super Admin cannot be deactivated' },
          { status: 403 }
        );
      }

      const callerRoles = auth?.currentRoles?.() ?? [SEEDED_ROLES.SUPER_ADMIN];
      const callerIsSuperAdmin = callerRoles.includes(SEEDED_ROLES.SUPER_ADMIN);
      if (operator.roles.includes(SEEDED_ROLES.SUPER_ADMIN) && !callerIsSuperAdmin) {
        return HttpResponse.json(
          { message: 'Only a Super Admin can deactivate a Super Admin' },
          { status: 403 }
        );
      }

      operator.active = false;
      operator.updatedAt = new Date().toISOString();
      return HttpResponse.json(operator, { status: 200 });
    }),

    http.put(`${API_URL}${API_PATHS.OPERATORS}/:id/roles`, async ({ request, params }) => {
      if (rejectsToken(request))
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });

      const operator = rows.find((r) => r.id === params.id);
      if (!operator) return HttpResponse.json({ message: 'Operator not found' }, { status: 404 });

      const body = (await request.json()) as { roles: string[] };
      const callerRoles = auth?.currentRoles?.() ?? [SEEDED_ROLES.SUPER_ADMIN];
      const callerIsSuperAdmin = callerRoles.includes(SEEDED_ROLES.SUPER_ADMIN);

      if (operator.roles.includes(SEEDED_ROLES.SUPER_ADMIN) && !callerIsSuperAdmin) {
        return HttpResponse.json(
          { message: "Only a Super Admin can change a Super Admin's Roles" },
          { status: 403 }
        );
      }

      const currentNames = operator.roles;
      const changed = [
        ...body.roles.filter((name) => !currentNames.includes(name)),
        ...currentNames.filter((name) => !body.roles.includes(name)),
      ];
      if (changed.some((name) => PROTECTED_ROLE_NAMES.includes(name)) && !callerIsSuperAdmin) {
        return HttpResponse.json(
          { message: 'Only a Super Admin can grant or remove a protected Role' },
          { status: 403 }
        );
      }

      if (operator.isBootstrap && !body.roles.includes(SEEDED_ROLES.SUPER_ADMIN)) {
        return HttpResponse.json(
          { message: 'The bootstrap Super Admin cannot lose Super Admin' },
          { status: 403 }
        );
      }

      operator.roles = body.roles;
      operator.updatedAt = new Date().toISOString();
      return HttpResponse.json(operator, { status: 200 });
    })
  );

  return {
    getRows: () => rows,
    failNextList: (status = 500) => {
      listFailure = { status, remaining: 1 };
    },
    failNextDeactivate: (status = 500) => {
      deactivateFailure = { status, remaining: 1 };
    },
  };
}
