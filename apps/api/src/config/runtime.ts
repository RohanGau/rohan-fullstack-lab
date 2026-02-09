import process from 'process';

export interface ApiRuntimeConfig {
  nodeEnv: string;
  isProduction: boolean;
  isProductionLike: boolean;
  port: number;
  requestTimeoutMs: number;
  rateLimitWindowMs: number;
  agentGatewayEnabled: boolean;
}

export function parseBooleanFlag(rawValue: string | undefined, fallback: boolean): boolean {
  if (rawValue === undefined) return fallback;
  const value = rawValue.trim().toLowerCase();
  if (value === 'true' || value === '1' || value === 'yes') return true;
  if (value === 'false' || value === '0' || value === 'no') return false;
  return fallback;
}

function parsePositiveNumber(rawValue: string | undefined, fallback: number): number {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

export function resolveRuntimeConfig(env: NodeJS.ProcessEnv = process.env): ApiRuntimeConfig {
  const nodeEnv = env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const isProductionLike = isProduction || nodeEnv === 'stage';

  return {
    nodeEnv,
    isProduction,
    isProductionLike,
    port: parsePositiveNumber(env.PORT, 5050),
    requestTimeoutMs: parsePositiveNumber(env.REQUEST_TIMEOUT_MS, 30_000),
    rateLimitWindowMs: 15 * 60 * 1000,
    agentGatewayEnabled: parseBooleanFlag(env.AGENT_GATEWAY_ENABLED, !isProduction),
  };
}
