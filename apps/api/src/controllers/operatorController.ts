import type { Request, Response } from 'express';
import type { IOperatorDto } from '@fullstack-lab/types';
import type { HydratedDocument } from 'mongoose';
import Operator, { type IOperatorDb } from '../models/Operator';
import type { IRoleDb } from '../models/Role';
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
