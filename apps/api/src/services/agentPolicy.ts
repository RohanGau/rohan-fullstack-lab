import { AGENT_POLICY_ACTIONS, MCP_TOOL_NAMES } from '@fullstack-lab/constants';
import type { AgentToolName, AuthUser, IAgentPolicyInfo } from '@fullstack-lab/types';

const READ_TOOLS = new Set<AgentToolName>([
  MCP_TOOL_NAMES.BLOGS_LIST_RECENT,
  MCP_TOOL_NAMES.BLOGS_GET_BY_ID_OR_SLUG,
]);

const WRITE_TOOLS = new Set<AgentToolName>([
  MCP_TOOL_NAMES.BLOGS_CREATE_DRAFT,
  MCP_TOOL_NAMES.BLOGS_UPDATE_DRAFT,
]);

const CONFIRM_REQUIRED_TOOLS = new Set<AgentToolName>([
  MCP_TOOL_NAMES.BLOGS_DELETE_DRAFT,
  MCP_TOOL_NAMES.BLOGS_PUBLISH_BLOG,
]);

const ALL_SUPPORTED_TOOLS = new Set<AgentToolName>([
  ...READ_TOOLS,
  ...WRITE_TOOLS,
  ...CONFIRM_REQUIRED_TOOLS,
]);

export function evaluateAgentPolicy(toolName: string, user?: AuthUser): IAgentPolicyInfo {
  if (!user) {
    return {
      action: AGENT_POLICY_ACTIONS.DENY,
      reason: 'Authentication required',
    };
  }

  if (user.role !== 'admin' && user.role !== 'editor') {
    return {
      action: AGENT_POLICY_ACTIONS.DENY,
      reason: 'Only admin/editor roles can execute agent tools',
    };
  }

  if (!ALL_SUPPORTED_TOOLS.has(toolName as AgentToolName)) {
    return {
      action: AGENT_POLICY_ACTIONS.DENY,
      reason: `Unsupported tool: ${toolName}`,
    };
  }

  if (READ_TOOLS.has(toolName as AgentToolName) || WRITE_TOOLS.has(toolName as AgentToolName)) {
    return {
      action: AGENT_POLICY_ACTIONS.ALLOW,
      reason: 'Policy allows this tool for the current role',
    };
  }

  return {
    action: AGENT_POLICY_ACTIONS.CONFIRM,
    reason: 'Sensitive action requires explicit confirmation',
  };
}
