import { PROTECTED_ROLE_NAMES, SEEDED_ROLES } from '@fullstack-lab/constants';

/** Who may do what with Roles. One place, used by every endpoint that grants or edits them. */
export const isSuperAdmin = (roleNames: readonly string[]): boolean =>
  roleNames.includes(SEEDED_ROLES.SUPER_ADMIN);

export const isProtectedRole = (roleName: string): boolean =>
  PROTECTED_ROLE_NAMES.includes(roleName);

/** Only a Super Admin may grant a protected Role; anyone with the right Permission may grant the rest. */
export const canGrantRole = (callerRoleNames: readonly string[], roleName: string): boolean =>
  !isProtectedRole(roleName) || isSuperAdmin(callerRoleNames);
