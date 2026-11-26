import express from 'express';
import { PERMISSIONS } from '@fullstack-lab/constants';
import { requirePermission } from '../middleware/requirePermission';
import {
  handleAgentChat,
  handleAgentConfirm,
  validateAgentChat,
  validateAgentConfirm,
} from '../controllers/agentController';

const router = express.Router();
const canUseAgent = requirePermission(PERMISSIONS.AGENT_USE);

router.post('/chat', canUseAgent, validateAgentChat, handleAgentChat);
router.post('/confirm', canUseAgent, validateAgentConfirm, handleAgentConfirm);

export default router;
