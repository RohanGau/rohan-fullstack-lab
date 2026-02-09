import { createHash } from 'node:crypto';
import { nanoid } from 'nanoid';
import { AGENT_DEFAULTS } from '@fullstack-lab/constants';
import type { AgentToolName, AuthUser, IAgentPendingIntentRecord } from '@fullstack-lab/types';
import { redisRest } from './redis-rest';

const INTENT_PREFIX = 'agent:confirm:intent:';
const TOKEN_PREFIX = 'agent:confirm:token:';

const inMemoryIntents = new Map<string, IAgentPendingIntentRecord>();
const inMemoryTokenToIntent = new Map<string, { intentId: string; expiresAtMs: number }>();

type ConfirmIssueResult =
  | {
      ok: true;
      confirmToken: string;
      expiresAt: string;
    }
  | {
      ok: false;
      status: 'not_found' | 'expired' | 'forbidden';
      message: string;
    };

type ConfirmConsumeResult =
  | { ok: true }
  | {
      ok: false;
      status: 'denied' | 'expired';
      message: string;
    };

function parseTtlSecondsFromEnv(): number {
  const raw = Number(process.env.AGENT_CONFIRM_TTL_SECONDS);
  if (!Number.isFinite(raw) || raw <= 0) {
    return AGENT_DEFAULTS.CONFIRM_TTL_SECONDS;
  }
  return Math.min(Math.floor(raw), 3600);
}

const CONFIRM_TTL_SECONDS = parseTtlSecondsFromEnv();

function intentKey(intentId: string): string {
  return `${INTENT_PREFIX}${intentId}`;
}

function tokenKey(confirmToken: string): string {
  return `${TOKEN_PREFIX}${confirmToken}`;
}

function cleanupMemory(now = Date.now()): void {
  for (const [intentId, intent] of inMemoryIntents.entries()) {
    if (intent.expiresAtMs <= now) {
      inMemoryIntents.delete(intentId);
    }
  }

  for (const [token, value] of inMemoryTokenToIntent.entries()) {
    if (value.expiresAtMs <= now) {
      inMemoryTokenToIntent.delete(token);
    }
  }
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`);
  return `{${entries.join(',')}}`;
}

async function getIntent(intentId: string): Promise<IAgentPendingIntentRecord | null> {
  const now = Date.now();

  if (redisRest) {
    const intent = await redisRest.get<IAgentPendingIntentRecord>(intentKey(intentId));
    if (!intent) return null;
    if (intent.expiresAtMs <= now) {
      await redisRest.del(intentKey(intentId));
      return null;
    }
    return intent;
  }

  cleanupMemory(now);
  return inMemoryIntents.get(intentId) ?? null;
}

async function setIntent(intent: IAgentPendingIntentRecord): Promise<void> {
  const ttlSeconds = Math.max(1, Math.ceil((intent.expiresAtMs - Date.now()) / 1000));

  if (redisRest) {
    await redisRest.set(intentKey(intent.intentId), intent as any, { ex: ttlSeconds });
    return;
  }

  inMemoryIntents.set(intent.intentId, intent);
}

async function setTokenIndex(
  confirmToken: string,
  intent: IAgentPendingIntentRecord
): Promise<void> {
  const ttlSeconds = Math.max(1, Math.ceil((intent.expiresAtMs - Date.now()) / 1000));

  if (redisRest) {
    await redisRest.set(tokenKey(confirmToken), intent.intentId, { ex: ttlSeconds });
    return;
  }

  inMemoryTokenToIntent.set(confirmToken, {
    intentId: intent.intentId,
    expiresAtMs: intent.expiresAtMs,
  });
}

async function getIntentIdByToken(confirmToken: string): Promise<string | null> {
  const now = Date.now();

  if (redisRest) {
    const intentId = await redisRest.get<string>(tokenKey(confirmToken));
    return intentId ?? null;
  }

  cleanupMemory(now);
  return inMemoryTokenToIntent.get(confirmToken)?.intentId ?? null;
}

async function deleteIntent(intent: IAgentPendingIntentRecord): Promise<void> {
  if (redisRest) {
    await redisRest.del(intentKey(intent.intentId));
    if (intent.confirmToken) {
      await redisRest.del(tokenKey(intent.confirmToken));
    }
    return;
  }

  inMemoryIntents.delete(intent.intentId);
  if (intent.confirmToken) {
    inMemoryTokenToIntent.delete(intent.confirmToken);
  }
}

export function hashToolInput(input: unknown): string {
  return createHash('sha256')
    .update(stableStringify(input ?? {}))
    .digest('hex');
}

export async function createPendingIntent(params: {
  actor: AuthUser;
  toolName: AgentToolName;
  inputHash: string;
}): Promise<{ intentId: string; expiresAt: string }> {
  const intentId = nanoid(24);
  const expiresAtMs = Date.now() + CONFIRM_TTL_SECONDS * 1000;
  const intent: IAgentPendingIntentRecord = {
    intentId,
    actorId: params.actor.id,
    actorRole: params.actor.role,
    toolName: params.toolName,
    inputHash: params.inputHash,
    expiresAtMs,
  };

  await setIntent(intent);

  return {
    intentId,
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

export async function issueConfirmToken(params: {
  intentId: string;
  actor: AuthUser;
}): Promise<ConfirmIssueResult> {
  const intent = await getIntent(params.intentId);
  if (!intent) {
    return {
      ok: false,
      status: 'not_found',
      message: 'Intent not found',
    };
  }

  if (intent.expiresAtMs <= Date.now()) {
    await deleteIntent(intent);
    return {
      ok: false,
      status: 'expired',
      message: 'Intent is expired',
    };
  }

  if (intent.actorId !== params.actor.id) {
    return {
      ok: false,
      status: 'forbidden',
      message: 'Intent belongs to a different actor',
    };
  }

  const confirmToken = intent.confirmToken ?? nanoid(36);
  intent.confirmToken = confirmToken;

  await setIntent(intent);
  await setTokenIndex(confirmToken, intent);

  return {
    ok: true,
    confirmToken,
    expiresAt: new Date(intent.expiresAtMs).toISOString(),
  };
}

export async function consumeConfirmToken(params: {
  confirmToken: string;
  actor: AuthUser;
  toolName: AgentToolName;
  inputHash: string;
}): Promise<ConfirmConsumeResult> {
  const intentId = await getIntentIdByToken(params.confirmToken);
  if (!intentId) {
    return {
      ok: false,
      status: 'denied',
      message: 'Invalid confirmation token',
    };
  }

  const intent = await getIntent(intentId);
  if (!intent) {
    return {
      ok: false,
      status: 'denied',
      message: 'Confirmation intent was not found',
    };
  }

  if (intent.expiresAtMs <= Date.now()) {
    await deleteIntent(intent);
    return {
      ok: false,
      status: 'expired',
      message: 'Confirmation token is expired',
    };
  }

  if (
    intent.actorId !== params.actor.id ||
    intent.toolName !== params.toolName ||
    intent.inputHash !== params.inputHash
  ) {
    return {
      ok: false,
      status: 'denied',
      message: 'Confirmation token does not match this action',
    };
  }

  await deleteIntent(intent);
  return { ok: true };
}
