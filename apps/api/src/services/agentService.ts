import {
  AGENT_CONFIRM_STATUS,
  AGENT_EXECUTION_STATUS,
  AGENT_POLICY_ACTIONS,
} from '@fullstack-lab/constants';
import type {
  IAgentChatExecutionInput,
  IAgentChatResponse,
  IAgentConfirmRequest,
  IAgentConfirmResponse,
  IAgentRequestContext,
} from '@fullstack-lab/types';
import {
  consumeConfirmToken,
  createPendingIntent,
  hashToolInput,
  issueConfirmToken,
} from '../lib/agentConfirmStore';
import { executeAgentTool } from './agentDispatcher';
import { evaluateAgentPolicy } from './agentPolicy';

function withChatRequestId(
  payload: Omit<IAgentChatResponse, 'requestId'>,
  requestId: string | undefined
): IAgentChatResponse {
  return {
    ...payload,
    requestId,
  };
}

function withConfirmRequestId(
  payload: Omit<IAgentConfirmResponse, 'requestId'>,
  requestId: string | undefined
): IAgentConfirmResponse {
  return {
    ...payload,
    requestId,
  };
}

export async function executeAgentChat(
  input: IAgentChatExecutionInput
): Promise<IAgentChatResponse> {
  const { payload, context } = input;
  const toolInput = payload.toolInput ?? {};
  const decision = evaluateAgentPolicy(payload.toolName, context.user);

  if (decision.action === AGENT_POLICY_ACTIONS.DENY) {
    return withChatRequestId(
      {
        status: AGENT_EXECUTION_STATUS.DENIED,
        message: decision.reason,
        toolName: payload.toolName,
        policy: decision,
      },
      context.requestId
    );
  }

  const inputHash = hashToolInput(toolInput);

  if (decision.action === AGENT_POLICY_ACTIONS.CONFIRM) {
    if (!payload.confirmToken) {
      const confirmation = await createPendingIntent({
        actor: context.user,
        toolName: payload.toolName,
        inputHash,
      });

      return withChatRequestId(
        {
          status: AGENT_EXECUTION_STATUS.CONFIRMATION_REQUIRED,
          message: 'Confirmation required before executing this sensitive action',
          toolName: payload.toolName,
          policy: decision,
          confirmation,
        },
        context.requestId
      );
    }

    const consumeResult = await consumeConfirmToken({
      confirmToken: payload.confirmToken,
      actor: context.user,
      toolName: payload.toolName,
      inputHash,
    });

    if (!consumeResult.ok) {
      return withChatRequestId(
        {
          status: AGENT_EXECUTION_STATUS.DENIED,
          message: consumeResult.message,
          toolName: payload.toolName,
          policy: decision,
        },
        context.requestId
      );
    }
  }

  if (payload.dryRun) {
    return withChatRequestId(
      {
        status: AGENT_EXECUTION_STATUS.SUCCESS,
        message: 'Dry-run complete. No mutation executed.',
        toolName: payload.toolName,
        policy: decision,
        result: {
          dryRun: true,
          toolName: payload.toolName,
          toolInput,
        },
      },
      context.requestId
    );
  }

  try {
    const result = await executeAgentTool(payload.toolName, toolInput);
    return withChatRequestId(
      {
        status: AGENT_EXECUTION_STATUS.SUCCESS,
        message: 'Tool executed successfully',
        toolName: payload.toolName,
        policy: decision,
        result,
      },
      context.requestId
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tool execution failed';
    return withChatRequestId(
      {
        status: AGENT_EXECUTION_STATUS.ERROR,
        message,
        toolName: payload.toolName,
        policy: decision,
      },
      context.requestId
    );
  }
}

export async function confirmAgentIntent(
  payload: IAgentConfirmRequest,
  context: IAgentRequestContext
): Promise<IAgentConfirmResponse> {
  const result = await issueConfirmToken({
    intentId: payload.intentId,
    actor: context.user,
  });

  if (!result.ok) {
    if (result.status === 'not_found') {
      return withConfirmRequestId(
        {
          status: AGENT_CONFIRM_STATUS.NOT_FOUND,
          message: result.message,
        },
        context.requestId
      );
    }

    if (result.status === 'expired') {
      return withConfirmRequestId(
        {
          status: AGENT_CONFIRM_STATUS.EXPIRED,
          message: result.message,
        },
        context.requestId
      );
    }

    return withConfirmRequestId(
      {
        status: AGENT_CONFIRM_STATUS.FORBIDDEN,
        message: result.message,
      },
      context.requestId
    );
  }

  return withConfirmRequestId(
    {
      status: AGENT_CONFIRM_STATUS.CONFIRMED,
      message: 'Confirmation token issued',
      confirmToken: result.confirmToken,
      expiresAt: result.expiresAt,
    },
    context.requestId
  );
}
