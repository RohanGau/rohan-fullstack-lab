import express from 'express';
import { PERMISSIONS } from '@fullstack-lab/constants';
import {
  createOperator,
  deactivateOperator,
  listOperators,
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

export default router;
