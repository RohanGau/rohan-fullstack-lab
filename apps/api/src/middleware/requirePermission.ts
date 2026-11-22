import type { NextFunction, Request, Response } from 'express';
import type { Permission } from '@fullstack-lab/constants';
import { resolveOperatorAccess } from '../services/operatorAccess';
import { requireAuth } from './requireAuth';

/**
 * Lets through only an active Operator whose Roles currently include `permission`.
 * Permissions are read from the database on every request, so Role edits and
 * deactivation take effect at once, not when the access token expires.
 * 401: no or bad token. 403: signed in but not allowed (including the static admin token,
 * which is not an Operator).
 */
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) =>
    requireAuth(req, res, async (authError?: unknown) => {
      if (authError) return next(authError);
      try {
        const access = await resolveOperatorAccess(req.user!.id);
        if (!access || !access.permissions.includes(permission)) {
          return res.status(403).json({ message: 'Forbidden: missing permission' });
        }
        req.operator = { id: req.user!.id, email: req.user!.email, ...access };
        return next();
      } catch (error) {
        return next(error);
      }
    });
}
