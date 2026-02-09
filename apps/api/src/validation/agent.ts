import Joi from 'joi';
import { MCP_TOOL_NAMES } from '@fullstack-lab/constants';

const toolNames = Object.values(MCP_TOOL_NAMES);

export const agentChatSchema = Joi.object({
  message: Joi.string().trim().max(4000).optional(),
  conversationId: Joi.string().trim().max(128).optional(),
  toolName: Joi.string()
    .valid(...toolNames)
    .required(),
  toolInput: Joi.object().unknown(true).default({}),
  confirmToken: Joi.string().trim().max(512).optional(),
  dryRun: Joi.boolean().default(false),
})
  .required()
  .unknown(false);

export const agentConfirmSchema = Joi.object({
  intentId: Joi.string().trim().min(8).max(128).required(),
})
  .required()
  .unknown(false);
