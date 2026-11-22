import type { Request, Response } from 'express';
import type { IOperatorDto } from '@fullstack-lab/types';
import type { HydratedDocument } from 'mongoose';
import { PERMISSIONS, SEEDED_ROLES } from '@fullstack-lab/constants';
import { isValidObjectId } from 'mongoose';
import Operator, { type IOperatorDb } from '../models/Operator';
import Role, { type IRoleDb } from '../models/Role';
import { canGrantRole, isSuperAdmin } from '../services/rolePolicy';
import { validateSchema } from '../validation';
import { assignRolesSchema } from '../validation/roles';
import { createOperatorSchema } from '../validation/operators';
import { CMS_ERROR_MESSAGES } from '../utils/constant';
import logger from '../utils/logger';
import { parseListParams, setListHeaders } from '../lib/http';
import { sanitizeMongoFilter } from '../utils/sanitizeFilter';

type PopulatedOperator = HydratedDocument<Omit<IOperatorDb, 'roles'> & { roles: IRoleDb[] }>;

/** The API's view of an Operator: never the Google account's identifier. */
export function toOperatorDto(operator: PopulatedOperator): IOperatorDto {
  const timestamps = operator as unknown as { createdAt: Date; updatedAt: Date };
  return {
    id: operator.id,
    email: operator.email,
    roles: operator.roles.map((role) => role.name),
    active: operator.active,
    isBootstrap: operator.isBootstrap,
    hasSignedIn: Boolean(operator.googleSub),
    createdAt: timestamps.createdAt.toISOString(),
    updatedAt: timestamps.updatedAt.toISOString(),
  };
}

const SORTABLE = ['email', 'createdAt', 'updatedAt'];

export async function listOperators(req: Request, res: Response) {
  try {
    const { filter, sort, limit, skip } = parseListParams(req.query as Record<string, unknown>);
    const mongoFilter = sanitizeMongoFilter(filter, ['email', 'active']);
    const sortField = SORTABLE.includes(sort[0]) ? sort[0] : 'createdAt';

    const total = await Operator.countDocuments(mongoFilter);
    const operators = await Operator.find(mongoFilter)
      .sort({ [sortField]: sort[1] === 'ASC' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .populate<{ roles: IRoleDb[] }>('roles');

    setListHeaders(res, skip, operators.length, total);
    res.status(200).json(operators.map((operator) => toOperatorDto(operator as PopulatedOperator)));
  } catch (error) {
    logger.error({ err: error }, 'Listing Operators failed');
    res.status(500).json({ message: 'Could not list Operators' });
  }
}

export const validateCreateOperator = validateSchema(createOperatorSchema);
export const validateAssignRoles = validateSchema(assignRolesSchema);

const DUPLICATE_KEY = 11000;

/** Pre-registers someone: only a registered email can sign in. */
export async function createOperator(req: Request, res: Response) {
  const { email, roles: roleNames } = req.validatedBody as { email: string; roles: string[] };
  const caller = req.operator!;

  try {
    if (roleNames.length > 0 && !caller.permissions.includes(PERMISSIONS.OPERATOR_ASSIGN_ROLE)) {
      return res.status(403).json({ message: 'Forbidden: missing permission' });
    }

    const roles = await Role.find({ name: { $in: roleNames } });
    const unknown = roleNames.filter((name) => !roles.some((role) => role.name === name));
    if (unknown.length > 0) {
      return res.status(400).json({
        msg: CMS_ERROR_MESSAGES.VALIDATION_ERROR,
        error: unknown.map((name) => ({ field: 'roles', message: `Unknown role: ${name}` })),
      });
    }
    if (roleNames.some((name) => !canGrantRole(caller.roles, name))) {
      return res.status(403).json({ message: 'Only a Super Admin can grant a protected Role' });
    }

    const operator = await Operator.create({ email, roles: roles.map((role) => role._id) });
    await operator.populate<{ roles: IRoleDb[] }>('roles');
    return res.status(201).json(toOperatorDto(operator as unknown as PopulatedOperator));
  } catch (error) {
    if ((error as { code?: number }).code === DUPLICATE_KEY) {
      return res.status(409).json({ message: 'An Operator with this email already exists' });
    }
    logger.error({ err: error }, 'Creating an Operator failed');
    return res.status(500).json({ message: 'Could not create the Operator' });
  }
}

/** Ends an Operator's access now: no new sign-ins, no refreshes, and guarded routes refuse them at once. */
export async function deactivateOperator(req: Request, res: Response) {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(404).json({ message: 'Operator not found' });

  try {
    const target = await Operator.findById(id).populate<{ roles: IRoleDb[] }>('roles');
    if (!target) return res.status(404).json({ message: 'Operator not found' });

    if (target.isBootstrap) {
      return res.status(403).json({ message: 'The bootstrap Super Admin cannot be deactivated' });
    }
    const targetRoles = target.roles.map((role) => role.name);
    if (isSuperAdmin(targetRoles) && !isSuperAdmin(req.operator!.roles)) {
      return res.status(403).json({ message: 'Only a Super Admin can deactivate a Super Admin' });
    }

    target.active = false;
    await target.save();
    return res.status(200).json(toOperatorDto(target as unknown as PopulatedOperator));
  } catch (error) {
    logger.error({ err: error }, 'Deactivating an Operator failed');
    return res.status(500).json({ message: 'Could not deactivate the Operator' });
  }
}

/** Replaces an Operator's Roles, within what the caller is allowed to hand out or take away. */
export async function assignRoles(req: Request, res: Response) {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(404).json({ message: 'Operator not found' });
  const { roles: roleNames } = req.validatedBody as { roles: string[] };
  const callerRoles = req.operator!.roles;

  try {
    const target = await Operator.findById(id).populate<{ roles: IRoleDb[] }>('roles');
    if (!target) return res.status(404).json({ message: 'Operator not found' });

    const currentNames = target.roles.map((role) => role.name);
    if (isSuperAdmin(currentNames) && !isSuperAdmin(callerRoles)) {
      return res
        .status(403)
        .json({ message: "Only a Super Admin can change a Super Admin's Roles" });
    }

    const roles = await Role.find({ name: { $in: roleNames } });
    const unknown = roleNames.filter((name) => !roles.some((role) => role.name === name));
    if (unknown.length > 0) {
      return res.status(400).json({
        msg: CMS_ERROR_MESSAGES.VALIDATION_ERROR,
        error: unknown.map((name) => ({ field: 'roles', message: `Unknown role: ${name}` })),
      });
    }

    // Granting or taking away a protected Role is a Super Admin's call.
    const changed = [
      ...roleNames.filter((name) => !currentNames.includes(name)),
      ...currentNames.filter((name) => !roleNames.includes(name)),
    ];
    if (changed.some((name) => !canGrantRole(callerRoles, name))) {
      return res
        .status(403)
        .json({ message: 'Only a Super Admin can grant or remove a protected Role' });
    }
    if (target.isBootstrap && !roleNames.includes(SEEDED_ROLES.SUPER_ADMIN)) {
      return res.status(403).json({ message: 'The bootstrap Super Admin cannot lose Super Admin' });
    }

    await Operator.updateOne({ _id: target._id }, { roles: roles.map((role) => role._id) });
    const updated = await Operator.findById(id).populate<{ roles: IRoleDb[] }>('roles');
    return res.status(200).json(toOperatorDto(updated as unknown as PopulatedOperator));
  } catch (error) {
    logger.error({ err: error }, 'Assigning Roles failed');
    return res.status(500).json({ message: 'Could not change the Operator’s Roles' });
  }
}
