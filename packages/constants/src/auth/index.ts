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
