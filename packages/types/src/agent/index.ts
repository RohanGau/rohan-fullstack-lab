import type { AuthUser } from '../auth';

export type AgentToolName =
  | 'blogs_create_draft'
  | 'blogs_list_recent'
  | 'blogs_get_by_id_or_slug'
  | 'blogs_update_draft'
  | 'blogs_delete_draft'
  | 'blogs_publish_blog';

export type AgentPolicyAction = 'allow' | 'confirm' | 'deny';

export type AgentExecutionStatus = 'success' | 'confirmation_required' | 'denied' | 'error';

export type AgentConfirmStatus = 'confirmed' | 'not_found' | 'expired' | 'forbidden';

export interface IAgentChatRequest {
  message?: string;
  conversationId?: string;
  toolName: AgentToolName;
  toolInput?: Record<string, unknown>;
  confirmToken?: string;
  dryRun?: boolean;
}

export interface IAgentPolicyInfo {
  action: AgentPolicyAction;
  reason: string;
}

export interface IAgentConfirmationInfo {
  intentId: string;
  expiresAt: string;
}

export interface IAgentChatResponse {
  status: AgentExecutionStatus;
  message: string;
  toolName: AgentToolName;
  policy: IAgentPolicyInfo;
  requestId?: string;
  result?: unknown;
  confirmation?: IAgentConfirmationInfo;
}

export interface IAgentConfirmRequest {
  intentId: string;
}

export interface IAgentConfirmResponse {
  status: AgentConfirmStatus;
  message: string;
  requestId?: string;
  confirmToken?: string;
  expiresAt?: string;
}

export interface IAgentRequestContext {
  user: AuthUser;
  requestId?: string;
}

export interface IAgentChatExecutionInput {
  payload: IAgentChatRequest;
  context: IAgentRequestContext;
}

export interface IAgentPendingIntentRecord {
  intentId: string;
  actorId: string;
  actorRole: AuthUser['role'];
  toolName: AgentToolName;
  inputHash: string;
  expiresAtMs: number;
  confirmToken?: string;
}
