import { describe, expect, it } from 'vitest';
import { AGENT_POLICY_ACTIONS, MCP_TOOL_NAMES, PERMISSIONS } from '@fullstack-lab/constants';
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
  it('allows read tools with agent:use permission', () => {
    const result = evaluateAgentPolicy(MCP_TOOL_NAMES.BLOGS_LIST_RECENT, editorUser, [
      PERMISSIONS.AGENT_USE,
    ]);
    expect(result.action).toBe(AGENT_POLICY_ACTIONS.ALLOW);
  });

  it('allows draft write tools when holding agent:use and tool permission', () => {
    const result = evaluateAgentPolicy(MCP_TOOL_NAMES.BLOGS_CREATE_DRAFT, editorUser, [
      PERMISSIONS.AGENT_USE,
      PERMISSIONS.BLOG_CREATE,
    ]);
    expect(result.action).toBe(AGENT_POLICY_ACTIONS.ALLOW);
  });

  it('requires confirmation for sensitive tools when holding required permissions', () => {
    const publishResult = evaluateAgentPolicy(MCP_TOOL_NAMES.BLOGS_PUBLISH_BLOG, adminUser, [
      PERMISSIONS.AGENT_USE,
      PERMISSIONS.BLOG_UPDATE,
    ]);
    expect(publishResult.action).toBe(AGENT_POLICY_ACTIONS.CONFIRM);

    const deleteResult = evaluateAgentPolicy(MCP_TOOL_NAMES.BLOGS_DELETE_DRAFT, adminUser, [
      PERMISSIONS.AGENT_USE,
      PERMISSIONS.BLOG_DELETE,
    ]);
    expect(deleteResult.action).toBe(AGENT_POLICY_ACTIONS.CONFIRM);
  });

  it('denies unauthenticated callers', () => {
    const result = evaluateAgentPolicy(MCP_TOOL_NAMES.BLOGS_LIST_RECENT, undefined, [
      PERMISSIONS.AGENT_USE,
    ]);
    expect(result.action).toBe(AGENT_POLICY_ACTIONS.DENY);
  });

  it('denies callers without agent:use even with admin role', () => {
    const result = evaluateAgentPolicy(MCP_TOOL_NAMES.BLOGS_LIST_RECENT, adminUser, [
      PERMISSIONS.BLOG_CREATE,
      PERMISSIONS.BLOG_UPDATE,
    ]);
    expect(result.action).toBe(AGENT_POLICY_ACTIONS.DENY);
  });

  it('denies write or sensitive tools when underlying tool permission is missing', () => {
    const createResult = evaluateAgentPolicy(MCP_TOOL_NAMES.BLOGS_CREATE_DRAFT, regularUser, [
      PERMISSIONS.AGENT_USE,
    ]);
    expect(createResult.action).toBe(AGENT_POLICY_ACTIONS.DENY);

    const deleteResult = evaluateAgentPolicy(MCP_TOOL_NAMES.BLOGS_DELETE_DRAFT, adminUser, [
      PERMISSIONS.AGENT_USE,
      PERMISSIONS.BLOG_UPDATE,
    ]);
    expect(deleteResult.action).toBe(AGENT_POLICY_ACTIONS.DENY);
  });

  it('denies unknown tool names', () => {
    const result = evaluateAgentPolicy('unknown_tool', adminUser, [PERMISSIONS.AGENT_USE]);
    expect(result.action).toBe(AGENT_POLICY_ACTIONS.DENY);
  });
});
