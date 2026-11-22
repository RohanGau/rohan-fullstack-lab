import express from 'express';
import { PERMISSIONS } from '@fullstack-lab/constants';
import {
  assignRoles,
  createOperator,
  deactivateOperator,
  listOperators,
  validateAssignRoles,
  validateCreateOperator,
} from '../controllers/operatorController';
import { requirePermission } from '../middleware/requirePermission';

const router = express.Router();

router.get('/', requirePermission(PERMISSIONS.OPERATOR_READ), listOperators);
router.post(
  '/',
  requirePermission(PERMISSIONS.OPERATOR_CREATE),
  validateCreateOperator,
  createOperator
);
router.post(
  '/:id/deactivate',
  requirePermission(PERMISSIONS.OPERATOR_DEACTIVATE),
  deactivateOperator
);

router.put(
  '/:id/roles',
  requirePermission(PERMISSIONS.OPERATOR_ASSIGN_ROLE),
  validateAssignRoles,
  assignRoles
);

export default router;
