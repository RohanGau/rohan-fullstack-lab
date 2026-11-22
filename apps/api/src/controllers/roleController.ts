import type { Request, Response } from 'express';
import { PERMISSION_VALUES, SEEDED_ROLES } from '@fullstack-lab/constants';
import type { IRoleDto } from '@fullstack-lab/types';
import { isValidObjectId } from 'mongoose';
import Operator from '../models/Operator';
import Role, { type RoleDocument } from '../models/Role';
import { parseListParams, setListHeaders } from '../lib/http';
import { isSuperAdmin } from '../services/rolePolicy';
import { CMS_ERROR_MESSAGES } from '../utils/constant';
import logger from '../utils/logger';
import { sanitizeMongoFilter } from '../utils/sanitizeFilter';
import { validateSchema } from '../validation';
import { createRoleSchema, updateRoleSchema } from '../validation/roles';

export const validateCreateRole = validateSchema(createRoleSchema);
export const validateUpdateRole = validateSchema(updateRoleSchema);

const DUPLICATE_KEY = 11000;

export function toRoleDto(role: RoleDocument): IRoleDto {
  const timestamps = role as unknown as { createdAt: Date; updatedAt: Date };
  return {
    id: role.id,
    name: role.name,
    isProtected: role.isProtected,
    permissions: [...role.permissions],
    createdAt: timestamps.createdAt.toISOString(),
    updatedAt: timestamps.updatedAt.toISOString(),
  };
}

function fieldErrors(field: string, messages: string[]) {
  return {
    msg: CMS_ERROR_MESSAGES.VALIDATION_ERROR,
    error: messages.map((message) => ({ field, message })),
  };
}

/** A Role can only be built from Permissions in the catalogue: nobody invents one at runtime. */
function unknownPermissionErrors(permissions: string[] | undefined) {
  const unknown = (permissions ?? []).filter(
    (permission) => !(PERMISSION_VALUES as readonly string[]).includes(permission)
  );
  return unknown.length > 0
    ? fieldErrors(
        'permissions',
        unknown.map((permission) => `Unknown permission: ${permission}`)
      )
    : null;
}

export async function listRoles(req: Request, res: Response) {
  try {
    const { filter, sort, limit, skip } = parseListParams(req.query as Record<string, unknown>);
    const mongoFilter = sanitizeMongoFilter(filter, ['name']);
    const sortField = ['name', 'createdAt', 'updatedAt'].includes(sort[0]) ? sort[0] : 'name';

    const total = await Role.countDocuments(mongoFilter);
    const roles = await Role.find(mongoFilter)
      .sort({ [sortField]: sort[1] === 'DESC' ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    setListHeaders(res, skip, roles.length, total);
    res.status(200).json(roles.map(toRoleDto));
  } catch (error) {
    logger.error({ err: error }, 'Listing Roles failed');
    res.status(500).json({ message: 'Could not list Roles' });
  }
}

export async function createRole(req: Request, res: Response) {
  const { name, permissions } = req.validatedBody as { name: string; permissions: string[] };
  const invalid = unknownPermissionErrors(permissions);
  if (invalid) return res.status(400).json(invalid);

  try {
    const role = await Role.create({ name, permissions, isProtected: false });
    return res.status(201).json(toRoleDto(role));
  } catch (error) {
    if ((error as { code?: number }).code === DUPLICATE_KEY) {
      return res.status(409).json({ message: 'A Role with this name already exists' });
    }
    logger.error({ err: error }, 'Creating a Role failed');
    return res.status(500).json({ message: 'Could not create the Role' });
  }
}

export async function updateRole(req: Request, res: Response) {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(404).json({ message: 'Role not found' });
  const { name, permissions } = req.validatedBody as { name?: string; permissions?: string[] };

  try {
    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    if (role.name === SEEDED_ROLES.SUPER_ADMIN) {
      return res.status(403).json({ message: 'The super_admin Role cannot be changed' });
    }
    if (role.isProtected && !isSuperAdmin(req.operator!.roles)) {
      return res.status(403).json({ message: 'Only a Super Admin can change a protected Role' });
    }
    if (role.isProtected && name !== undefined && name !== role.name) {
      return res.status(400).json(fieldErrors('name', ['A protected Role cannot be renamed']));
    }
    const invalid = unknownPermissionErrors(permissions);
    if (invalid) return res.status(400).json(invalid);

    if (name !== undefined) role.name = name;
    if (permissions !== undefined) role.permissions = permissions;
    await role.save();
    return res.status(200).json(toRoleDto(role));
  } catch (error) {
    if ((error as { code?: number }).code === DUPLICATE_KEY) {
      return res.status(409).json({ message: 'A Role with this name already exists' });
    }
    logger.error({ err: error }, 'Updating a Role failed');
    return res.status(500).json({ message: 'Could not update the Role' });
  }
}

export async function deleteRole(req: Request, res: Response) {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(404).json({ message: 'Role not found' });

  try {
    const role = await Role.findById(id);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    if (role.isProtected) {
      return res.status(403).json({ message: 'A protected Role cannot be deleted' });
    }
    const holders = await Operator.countDocuments({ roles: role._id });
    if (holders > 0) {
      return res.status(409).json({
        message: `This Role is still assigned to ${holders} Operator${holders === 1 ? '' : 's'}`,
      });
    }

    await role.deleteOne();
    return res.status(204).send();
  } catch (error) {
    logger.error({ err: error }, 'Deleting a Role failed');
    return res.status(500).json({ message: 'Could not delete the Role' });
  }
}
