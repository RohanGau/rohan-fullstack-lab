import { describe, expect, it } from 'vitest';
import { AGENT_POLICY_ACTIONS, MCP_TOOL_NAMES } from '@fullstack-lab/constants';
import type { AuthUser } from '@fullstack-lab/types';
import { evaluateAgentPolicy } from './agentPolicy';

const adminUser: AuthUser = {
  id: 'admin-1',
  role: 'admin',
  username: 'admin',
  email: 'admin@example.com',
};

const editorUser: AuthUser = {
  id: 'editor-1',
  role: 'editor',
  username: 'editor',
  email: 'editor@example.com',
};

const regularUser: AuthUser = {
  id: 'user-1',
  role: 'user',
  username: 'user',
  email: 'user@example.com',
};

describe('evaluateAgentPolicy', () => {
  it('allows read tools for admin', () => {
    const result = evaluateAgentPolicy(MCP_TOOL_NAMES.BLOGS_LIST_RECENT, adminUser);
    expect(result.action).toBe(AGENT_POLICY_ACTIONS.ALLOW);
  });

  it('allows draft write tools for editor', () => {
    const result = evaluateAgentPolicy(MCP_TOOL_NAMES.BLOGS_CREATE_DRAFT, editorUser);
    expect(result.action).toBe(AGENT_POLICY_ACTIONS.ALLOW);
  });

  it('requires confirmation for sensitive tools', () => {
    const result = evaluateAgentPolicy(MCP_TOOL_NAMES.BLOGS_PUBLISH_BLOG, adminUser);
    expect(result.action).toBe(AGENT_POLICY_ACTIONS.CONFIRM);
  });

  it('denies unsupported roles', () => {
    const result = evaluateAgentPolicy(MCP_TOOL_NAMES.BLOGS_CREATE_DRAFT, regularUser);
    expect(result.action).toBe(AGENT_POLICY_ACTIONS.DENY);
  });

  it('denies unknown tool names', () => {
    const result = evaluateAgentPolicy('unknown_tool', adminUser);
    expect(result.action).toBe(AGENT_POLICY_ACTIONS.DENY);
  });
});
