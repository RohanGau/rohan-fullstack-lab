import {
  AGENT_POLICY_ACTIONS,
  MCP_TOOL_NAMES,
  PERMISSIONS,
  type Permission,
} from '@fullstack-lab/constants';
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

const TOOL_PERMISSION: Partial<Record<AgentToolName, Permission>> = {
  [MCP_TOOL_NAMES.BLOGS_CREATE_DRAFT]: PERMISSIONS.BLOG_CREATE,
  [MCP_TOOL_NAMES.BLOGS_UPDATE_DRAFT]: PERMISSIONS.BLOG_UPDATE,
  [MCP_TOOL_NAMES.BLOGS_DELETE_DRAFT]: PERMISSIONS.BLOG_DELETE,
  [MCP_TOOL_NAMES.BLOGS_PUBLISH_BLOG]: PERMISSIONS.BLOG_UPDATE,
};

export function evaluateAgentPolicy(
  toolName: string,
  user?: AuthUser,
  permissions?: readonly string[]
): IAgentPolicyInfo {
  if (!user) {
    return {
      action: AGENT_POLICY_ACTIONS.DENY,
      reason: 'Authentication required',
    };
  }

  const held = new Set(permissions ?? []);
  if (!held.has(PERMISSIONS.AGENT_USE)) {
    return {
      action: AGENT_POLICY_ACTIONS.DENY,
      reason: `Missing required permission: ${PERMISSIONS.AGENT_USE}`,
    };
  }

  if (!ALL_SUPPORTED_TOOLS.has(toolName as AgentToolName)) {
    return {
      action: AGENT_POLICY_ACTIONS.DENY,
      reason: `Unsupported tool: ${toolName}`,
    };
  }

  const requiredPermission = TOOL_PERMISSION[toolName as AgentToolName];
  if (requiredPermission && !held.has(requiredPermission)) {
    return {
      action: AGENT_POLICY_ACTIONS.DENY,
      reason: `Missing required permission for ${toolName}: ${requiredPermission}`,
    };
  }

  if (READ_TOOLS.has(toolName as AgentToolName) || WRITE_TOOLS.has(toolName as AgentToolName)) {
    return {
      action: AGENT_POLICY_ACTIONS.ALLOW,
      reason: 'Policy allows this tool for the current permissions',
    };
  }

  return {
    action: AGENT_POLICY_ACTIONS.CONFIRM,
    reason: 'Sensitive action requires explicit confirmation',
  };
}
