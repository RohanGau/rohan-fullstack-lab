export const AUTH_TOKEN_TYPES = Object.freeze({
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const);

export const AUTH_TOKEN_DEFAULTS = Object.freeze({
  ISSUER: 'rohan-fullstack-lab',
  AUDIENCE: 'rohan-fullstack-lab-admin',
  ACCESS_TTL: '15m',
  REFRESH_TTL: '7d',
} as const);

/**
 * Permission catalogue: the single source of truth for what an Operator may be allowed to do.
 * Roles bundle these; nobody can add a permission at runtime.
 */
export const PERMISSIONS = Object.freeze({
  BLOG_CREATE: 'blog:create',
  BLOG_UPDATE: 'blog:update',
  BLOG_DELETE: 'blog:delete',
  PROJECT_CREATE: 'project:create',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROFILE_CREATE: 'profile:create',
  PROFILE_UPDATE: 'profile:update',
  PROFILE_DELETE: 'profile:delete',
  UPLOAD_CREATE: 'upload:create',
  UPLOAD_DELETE: 'upload:delete',
  CONTACT_READ: 'contact:read',
  CONTACT_DELETE: 'contact:delete',
  SLOT_READ: 'slot:read',
  SLOT_UPDATE: 'slot:update',
  SLOT_DELETE: 'slot:delete',
  OPERATOR_READ: 'operator:read',
  OPERATOR_CREATE: 'operator:create',
  OPERATOR_ASSIGN_ROLE: 'operator:assign-role',
  OPERATOR_DEACTIVATE: 'operator:deactivate',
  ROLE_MANAGE: 'role:manage',
  AGENT_USE: 'agent:use',
  DIAGNOSTICS_RUN: 'diagnostics:run',
} as const);

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_VALUES: readonly Permission[] = Object.freeze(Object.values(PERMISSIONS));

/** The Roles every deployment starts with (created at boot if missing). */
export const SEEDED_ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  CONTENT_MANAGER: 'content_manager',
  INBOX_MANAGER: 'inbox_manager',
  VIEWER: 'viewer',
} as const);

/** Only a Super Admin may grant, edit or delete these. */
export const PROTECTED_ROLE_NAMES: readonly string[] = Object.freeze([
  SEEDED_ROLES.SUPER_ADMIN,
  SEEDED_ROLES.ADMIN,
]);

/**
 * What each seeded Role holds when first created. Super Admin holds every Permission
 * implicitly (including future ones), so it stores none. Admin starts with the whole
 * catalogue: what stops an Admin is the Protected role rules, not missing Permissions.
 * Once created, a Role's Permissions are edited in the database and never reset by boot.
 */
export const SEEDED_ROLE_PERMISSIONS: Readonly<Record<string, readonly Permission[]>> =
  Object.freeze({
    [SEEDED_ROLES.SUPER_ADMIN]: [],
    [SEEDED_ROLES.ADMIN]: PERMISSION_VALUES,
    [SEEDED_ROLES.CONTENT_MANAGER]: [
      PERMISSIONS.BLOG_CREATE,
      PERMISSIONS.BLOG_UPDATE,
      PERMISSIONS.BLOG_DELETE,
      PERMISSIONS.PROJECT_CREATE,
      PERMISSIONS.PROJECT_UPDATE,
      PERMISSIONS.PROJECT_DELETE,
      PERMISSIONS.PROFILE_CREATE,
      PERMISSIONS.PROFILE_UPDATE,
      PERMISSIONS.PROFILE_DELETE,
      PERMISSIONS.UPLOAD_CREATE,
      PERMISSIONS.UPLOAD_DELETE,
    ],
    [SEEDED_ROLES.INBOX_MANAGER]: [
      PERMISSIONS.CONTACT_READ,
      PERMISSIONS.CONTACT_DELETE,
      PERMISSIONS.SLOT_READ,
      PERMISSIONS.SLOT_UPDATE,
      PERMISSIONS.SLOT_DELETE,
    ],
    [SEEDED_ROLES.VIEWER]: [PERMISSIONS.CONTACT_READ, PERMISSIONS.SLOT_READ],
  });
