import process from 'node:process';
import { MCP_DEFAULTS } from '@fullstack-lab/constants';

const MIN_TIMEOUT_MS = 500;
const MAX_TIMEOUT_MS = 120_000;

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  return fallback;
}

function parseInteger(value: string | undefined, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const normalized = Math.floor(n);
  if (normalized < MIN_TIMEOUT_MS) return MIN_TIMEOUT_MS;
  if (normalized > MAX_TIMEOUT_MS) return MAX_TIMEOUT_MS;
  return normalized;
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  return trimmed || MCP_DEFAULTS.API_BASE_URL;
}

function resolveApiToken(): string {
  const token =
    process.env.MCP_API_BEARER_TOKEN || process.env.MCP_API_TOKEN || process.env.ADMIN_TOKEN;
  if (!token?.trim()) {
    throw new Error(
      'Missing MCP API token. Set MCP_API_BEARER_TOKEN (or MCP_API_TOKEN), or ensure ADMIN_TOKEN is available for local legacy auth.'
    );
  }
  return token.trim();
}

export interface McpServerConfig {
  serverName: string;
  serverVersion: string;
  apiBaseUrl: string;
  apiBearerToken: string;
  actorId?: string;
  apiTimeoutMs: number;
  allowBlogPublish: boolean;
}

export function loadConfig(): McpServerConfig {
  const serverName = process.env.MCP_SERVER_NAME?.trim() || MCP_DEFAULTS.SERVER_NAME;
  const serverVersion = process.env.MCP_SERVER_VERSION?.trim() || MCP_DEFAULTS.SERVER_VERSION;
  const apiBaseUrl = normalizeBaseUrl(process.env.MCP_API_BASE_URL || MCP_DEFAULTS.API_BASE_URL);
  const actorId = process.env.MCP_ACTOR_ID?.trim() || undefined;
  const apiTimeoutMs = parseInteger(process.env.MCP_API_TIMEOUT_MS, 10_000);

  return {
    serverName,
    serverVersion,
    apiBaseUrl,
    apiBearerToken: resolveApiToken(),
    actorId,
    apiTimeoutMs,
    allowBlogPublish: parseBoolean(process.env.MCP_ALLOW_BLOG_PUBLISH, false),
  };
}
