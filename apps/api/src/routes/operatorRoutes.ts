import express from 'express';
import { PERMISSIONS } from '@fullstack-lab/constants';
import { listOperators } from '../controllers/operatorController';
import { requirePermission } from '../middleware/requirePermission';

const router = express.Router();

router.get('/', requirePermission(PERMISSIONS.OPERATOR_READ), listOperators);

export default router;
