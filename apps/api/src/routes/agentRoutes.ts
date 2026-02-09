import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
  handleAgentChat,
  handleAgentConfirm,
  validateAgentChat,
  validateAgentConfirm,
} from '../controllers/agentController';

const router = express.Router();

router.post('/chat', requireAuth, validateAgentChat, handleAgentChat);
router.post('/confirm', requireAuth, validateAgentConfirm, handleAgentConfirm);

export default router;
