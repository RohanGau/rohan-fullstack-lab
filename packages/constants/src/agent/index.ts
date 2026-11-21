export const AGENT_POLICY_ACTIONS = Object.freeze({
  ALLOW: 'allow',
  CONFIRM: 'confirm',
  DENY: 'deny',
} as const);

export type AgentPolicyActionValue =
  (typeof AGENT_POLICY_ACTIONS)[keyof typeof AGENT_POLICY_ACTIONS];

export const AGENT_EXECUTION_STATUS = Object.freeze({
  SUCCESS: 'success',
  CONFIRMATION_REQUIRED: 'confirmation_required',
  DENIED: 'denied',
  ERROR: 'error',
} as const);

export type AgentExecutionStatusValue =
  (typeof AGENT_EXECUTION_STATUS)[keyof typeof AGENT_EXECUTION_STATUS];

export const AGENT_CONFIRM_STATUS = Object.freeze({
  CONFIRMED: 'confirmed',
  NOT_FOUND: 'not_found',
  EXPIRED: 'expired',
  FORBIDDEN: 'forbidden',
} as const);

export type AgentConfirmStatusValue =
  (typeof AGENT_CONFIRM_STATUS)[keyof typeof AGENT_CONFIRM_STATUS];

export const AGENT_DEFAULTS = Object.freeze({
  CONFIRM_TTL_SECONDS: 600,
} as const);
