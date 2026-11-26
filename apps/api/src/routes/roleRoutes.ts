import express from 'express';
import { PERMISSIONS } from '@fullstack-lab/constants';
import {
  createRole,
  deleteRole,
  listRoles,
  updateRole,
  validateCreateRole,
  validateUpdateRole,
} from '../controllers/roleController';
import { requirePermission } from '../middleware/requirePermission';

const router = express.Router();
const manage = requirePermission(PERMISSIONS.ROLE_MANAGE);

router.get('/', manage, listRoles);
router.post('/', manage, validateCreateRole, createRole);
router.put('/:id', manage, validateUpdateRole, updateRole);
router.delete('/:id', manage, deleteRole);

export default router;
