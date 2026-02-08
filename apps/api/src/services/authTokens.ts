import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { AUTH_TOKEN_DEFAULTS, AUTH_TOKEN_TYPES } from '@fullstack-lab/constants';
import type {
  AccessTokenClaims,
  AuthTokenPair,
  AuthUser,
  RefreshTokenClaims,
} from '@fullstack-lab/types';
import { redisRest } from '../lib/redis-rest';
import logger from '../utils/logger';

type RefreshSession = AuthUser & {
  issuedAt: string;
};

type MemoryRefreshSession = {
  session: RefreshSession;
  expiresAt: number;
};

const memoryRefreshSessions = new Map<string, MemoryRefreshSession>();
const TOKEN_ISSUER = AUTH_TOKEN_DEFAULTS.ISSUER;
const TOKEN_AUDIENCE = AUTH_TOKEN_DEFAULTS.AUDIENCE;

const ACCESS_TOKEN_TTL_RAW = process.env.JWT_ACCESS_TOKEN_TTL || AUTH_TOKEN_DEFAULTS.ACCESS_TTL;
const REFRESH_TOKEN_TTL_RAW = process.env.JWT_REFRESH_TOKEN_TTL || AUTH_TOKEN_DEFAULTS.REFRESH_TTL;
const ACCESS_TOKEN_TTL_SECONDS = parseTtlToSeconds(ACCESS_TOKEN_TTL_RAW, 15 * 60);
const REFRESH_TOKEN_TTL_SECONDS = parseTtlToSeconds(REFRESH_TOKEN_TTL_RAW, 7 * 24 * 60 * 60);

function parseTtlToSeconds(raw: string, fallbackSeconds: number): number {
  const value = raw.trim();
  if (!value) return fallbackSeconds;

  if (/^\d+$/.test(value)) return Math.max(1, Number(value));

  const match = value.match(/^(\d+)([smhd])$/i);
  if (!match) return fallbackSeconds;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === 's') return amount;
  if (unit === 'm') return amount * 60;
  if (unit === 'h') return amount * 60 * 60;
  return amount * 24 * 60 * 60;
}

function cleanupMemoryRefreshSessions(now = Date.now()) {
  for (const [key, entry] of memoryRefreshSessions.entries()) {
    if (entry.expiresAt <= now) memoryRefreshSessions.delete(key);
  }
}

function getAccessSecret(): Secret {
  return process.env.JWT_ACCESS_SECRET || process.env.ADMIN_TOKEN || '';
}

function getRefreshSecret(): Secret {
  return (
    process.env.JWT_REFRESH_SECRET || process.env.JWT_ACCESS_SECRET || process.env.ADMIN_TOKEN || ''
  );
}

function ensureSecretsConfigured() {
  if (!getAccessSecret() || !getRefreshSecret()) {
    throw new Error('JWT secrets are not configured');
  }
}

function buildAccessToken(user: AuthUser): string {
  const payload: AccessTokenClaims & JwtPayload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    username: user.username,
    tokenType: AUTH_TOKEN_TYPES.ACCESS,
  };

  const options: SignOptions = {
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
    expiresIn: ACCESS_TOKEN_TTL_RAW as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, getAccessSecret(), options);
}

function buildRefreshToken(user: AuthUser, refreshJti: string): string {
  const payload: RefreshTokenClaims & JwtPayload = {
    sub: user.id,
    role: user.role,
    tokenType: AUTH_TOKEN_TYPES.REFRESH,
    jti: refreshJti,
  };

  const options: SignOptions = {
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
    expiresIn: REFRESH_TOKEN_TTL_RAW as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, getRefreshSecret(), options);
}

function refreshKey(refreshJti: string): string {
  return `auth:refresh:${refreshJti}`;
}

async function storeRefreshSession(refreshJti: string, session: RefreshSession) {
  if (redisRest) {
    await redisRest.set(refreshKey(refreshJti), session as any, { ex: REFRESH_TOKEN_TTL_SECONDS });
    return;
  }

  cleanupMemoryRefreshSessions();
  memoryRefreshSessions.set(refreshJti, {
    session,
    expiresAt: Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000,
  });
}

async function getRefreshSession(refreshJti: string): Promise<RefreshSession | null> {
  if (redisRest) {
    return (await redisRest.get<RefreshSession>(refreshKey(refreshJti))) ?? null;
  }

  cleanupMemoryRefreshSessions();
  return memoryRefreshSessions.get(refreshJti)?.session ?? null;
}

async function deleteRefreshSession(refreshJti: string) {
  if (redisRest) {
    await redisRest.del(refreshKey(refreshJti));
    return;
  }
  memoryRefreshSessions.delete(refreshJti);
}

export function isLegacyAdminToken(token: string): boolean {
  return Boolean(process.env.ADMIN_TOKEN) && token === process.env.ADMIN_TOKEN;
}

export function getLegacyAdminUser(): AuthUser {
  return {
    id: 'legacy-admin',
    role: 'admin',
    username: 'legacy-admin',
    email: process.env.ADMIN_EMAIL || 'admin@local',
  };
}

export function verifyAccessToken(token: string): AuthUser {
  ensureSecretsConfigured();
  const decoded = jwt.verify(token, getAccessSecret(), {
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
  }) as AccessTokenClaims;

  if (
    !decoded ||
    decoded.tokenType !== AUTH_TOKEN_TYPES.ACCESS ||
    typeof decoded.sub !== 'string'
  ) {
    throw new Error('Invalid access token');
  }

  return {
    id: decoded.sub,
    role: decoded.role,
    email: decoded.email,
    username: decoded.username,
  };
}

export async function issueAuthTokens(user: AuthUser): Promise<AuthTokenPair> {
  ensureSecretsConfigured();
  const refreshJti = nanoid();
  const refreshSession: RefreshSession = {
    ...user,
    issuedAt: new Date().toISOString(),
  };

  await storeRefreshSession(refreshJti, refreshSession);

  return {
    accessToken: buildAccessToken(user),
    refreshToken: buildRefreshToken(user, refreshJti),
    tokenType: 'Bearer',
    accessTokenTtlSeconds: ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTtlSeconds: REFRESH_TOKEN_TTL_SECONDS,
  };
}

export async function rotateRefreshToken(refreshToken: string): Promise<AuthTokenPair> {
  ensureSecretsConfigured();

  const decoded = jwt.verify(refreshToken, getRefreshSecret(), {
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
  }) as RefreshTokenClaims;

  if (
    !decoded ||
    decoded.tokenType !== AUTH_TOKEN_TYPES.REFRESH ||
    typeof decoded.sub !== 'string' ||
    !decoded.jti
  ) {
    throw new Error('Invalid refresh token');
  }

  const currentSession = await getRefreshSession(decoded.jti);
  if (!currentSession || currentSession.id !== decoded.sub) {
    throw new Error('Refresh token is revoked or expired');
  }

  await deleteRefreshSession(decoded.jti);

  return issueAuthTokens({
    id: currentSession.id,
    role: currentSession.role,
    email: currentSession.email,
    username: currentSession.username,
  });
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  try {
    const decoded = jwt.verify(refreshToken, getRefreshSecret(), {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    }) as RefreshTokenClaims;

    if (decoded?.jti) {
      await deleteRefreshSession(decoded.jti);
    }
  } catch (error) {
    logger.warn({ err: error }, 'Failed to revoke refresh token');
  }
}
