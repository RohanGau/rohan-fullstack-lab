import type { Request, Response } from 'express';
import { AGENT_CONFIRM_STATUS, AGENT_EXECUTION_STATUS } from '@fullstack-lab/constants';
import type { IAgentChatRequest, IAgentConfirmRequest } from '@fullstack-lab/types';
import { validateSchema } from '../validation';
import { agentChatSchema, agentConfirmSchema } from '../validation/agent';
import { confirmAgentIntent, executeAgentChat } from '../services/agentService';

export const validateAgentChat = validateSchema(agentChatSchema);
export const validateAgentConfirm = validateSchema(agentConfirmSchema);

function getChatStatusCode(status: string): number {
  if (status === AGENT_EXECUTION_STATUS.SUCCESS) return 200;
  if (status === AGENT_EXECUTION_STATUS.CONFIRMATION_REQUIRED) return 202;
  if (status === AGENT_EXECUTION_STATUS.DENIED) return 403;
  return 400;
}

function getConfirmStatusCode(status: string): number {
  if (status === AGENT_CONFIRM_STATUS.CONFIRMED) return 200;
  if (status === AGENT_CONFIRM_STATUS.NOT_FOUND) return 404;
  if (status === AGENT_CONFIRM_STATUS.EXPIRED) return 410;
  return 403;
}

export async function handleAgentChat(req: Request, res: Response): Promise<Response> {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const payload = (req.validatedBody ?? req.body) as IAgentChatRequest;
  const response = await executeAgentChat({
    payload,
    context: {
      user: req.user,
      requestId: req.requestId,
    },
  });

  return res.status(getChatStatusCode(response.status)).json(response);
}

export async function handleAgentConfirm(req: Request, res: Response): Promise<Response> {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const payload = (req.validatedBody ?? req.body) as IAgentConfirmRequest;
  const response = await confirmAgentIntent(payload, {
    user: req.user,
    requestId: req.requestId,
  });

  return res.status(getConfirmStatusCode(response.status)).json(response);
}
