import { isValidObjectId } from 'mongoose';
import { PERMISSION_VALUES } from '@fullstack-lab/constants';
import Operator from '../models/Operator';
import type { IRoleDb } from '../models/Role';
import { SUPER_ADMIN_ROLE } from './accessControlBootstrap';

export interface OperatorAccess {
  roles: string[];
  permissions: string[];
}

/**
 * Resolves an Operator's effective access from the database on every call, so Role
 * edits take effect immediately. Returns null when the id is not an active Operator.
 */
export async function resolveOperatorAccess(operatorId: string): Promise<OperatorAccess | null> {
  if (!isValidObjectId(operatorId)) return null;

  const operator = await Operator.findById(operatorId).populate<{ roles: IRoleDb[] }>('roles');
  // A deactivated Operator has no access, even with a token that has not yet expired.
  if (!operator || !operator.active) return null;

  const roles = operator.roles.map((role) => role.name);
  if (roles.includes(SUPER_ADMIN_ROLE)) {
    return { roles, permissions: [...PERMISSION_VALUES] };
  }

  const permissions = new Set<string>();
  for (const role of operator.roles) role.permissions.forEach((p) => permissions.add(p));
  return { roles, permissions: [...permissions] };
}
