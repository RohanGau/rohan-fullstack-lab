import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { AUTH_TOKEN_DEFAULTS, AUTH_TOKEN_TYPES } from '@fullstack-lab/constants';
import type {
  AccessTokenClaims,
  AuthTokenPair,
  AuthUser,
  RefreshTokenClaims,
} from '@fullstack-lab/types';
import { isValidObjectId } from 'mongoose';
import { redisRest } from '../lib/redis-rest';
import Operator from '../models/Operator';
import logger from '../utils/logger';

type RefreshSession = AuthUser & {
  issuedAt: string;
};

/**
 * One sign-in is one session family. Every refresh token descended from it carries
 * the family id; only the family's current token id is accepted. Presenting any
 * other (an already-rotated one) means the token leaked, so the family is deleted.
 */
type RefreshFamily = {
  session: RefreshSession;
  currentJti: string;
};

type MemoryRefreshFamily = {
  family: RefreshFamily;
  expiresAt: number;
};

const memoryRefreshFamilies = new Map<string, MemoryRefreshFamily>();
/** Token ids already exchanged, with their expiry. See claimRefreshJti. */
const memoryClaimedJtis = new Map<string, number>();
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

function cleanupMemoryRefreshFamilies(now = Date.now()) {
  for (const [key, entry] of memoryRefreshFamilies.entries()) {
    if (entry.expiresAt <= now) memoryRefreshFamilies.delete(key);
  }
}

// Signing secrets come from their own variables only: no fallback to each other or to ADMIN_TOKEN.
function getAccessSecret(): Secret {
  return process.env.JWT_ACCESS_SECRET || '';
}

function getRefreshSecret(): Secret {
  return process.env.JWT_REFRESH_SECRET || '';
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

function buildRefreshToken(user: AuthUser, refreshJti: string, familyId: string): string {
  const payload: RefreshTokenClaims & JwtPayload = {
    sub: user.id,
    role: user.role,
    tokenType: AUTH_TOKEN_TYPES.REFRESH,
    jti: refreshJti,
    fid: familyId,
  };

  const options: SignOptions = {
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
    expiresIn: REFRESH_TOKEN_TTL_RAW as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, getRefreshSecret(), options);
}

function familyKey(familyId: string): string {
  return `auth:refresh-family:${familyId}`;
}

async function storeFamily(familyId: string, family: RefreshFamily) {
  if (redisRest) {
    await redisRest.set(familyKey(familyId), family as any, { ex: REFRESH_TOKEN_TTL_SECONDS });
    return;
  }

  cleanupMemoryRefreshFamilies();
  memoryRefreshFamilies.set(familyId, {
    family,
    expiresAt: Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000,
  });
}

async function getFamily(familyId: string): Promise<RefreshFamily | null> {
  if (redisRest) {
    return (await redisRest.get<RefreshFamily>(familyKey(familyId))) ?? null;
  }

  cleanupMemoryRefreshFamilies();
  return memoryRefreshFamilies.get(familyId)?.family ?? null;
}

async function deleteFamily(familyId: string) {
  if (redisRest) {
    await redisRest.del(familyKey(familyId));
    return;
  }
  memoryRefreshFamilies.delete(familyId);
}

/**
 * Atomically marks a refresh token id as exchanged. Only the first caller gets true,
 * so two simultaneous refreshes with the same token can never both succeed
 * (Redis SET NX; a plain read-compare-write would let both pass).
 */
async function claimRefreshJti(jti: string): Promise<boolean> {
  if (redisRest) {
    const result = await redisRest.set(`auth:refresh-claimed:${jti}`, 1, {
      nx: true,
      ex: REFRESH_TOKEN_TTL_SECONDS,
    });
    return result === 'OK';
  }

  const now = Date.now();
  for (const [key, expiresAt] of memoryClaimedJtis.entries()) {
    if (expiresAt <= now) memoryClaimedJtis.delete(key);
  }
  if (memoryClaimedJtis.has(jti)) return false;
  memoryClaimedJtis.set(jti, now + REFRESH_TOKEN_TTL_SECONDS * 1000);
  return true;
}

/**
 * A deactivated Operator's sessions end the next time they try to refresh (their access token
 * is refused at once by requirePermission, and lives at most minutes). The database is the
 * authority, so there is no separate list of sessions to keep in step.
 */
async function isDeactivatedOperator(userId: string): Promise<boolean> {
  return (
    isValidObjectId(userId) && (await Operator.exists({ _id: userId, active: false })) !== null
  );
}

function verifyRefreshToken(refreshToken: string): RefreshTokenClaims {
  const decoded = jwt.verify(refreshToken, getRefreshSecret(), {
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
  }) as RefreshTokenClaims;

  if (
    !decoded ||
    decoded.tokenType !== AUTH_TOKEN_TYPES.REFRESH ||
    typeof decoded.sub !== 'string' ||
    !decoded.jti ||
    !decoded.fid
  ) {
    throw new Error('Invalid refresh token');
  }
  return decoded;
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

/** Starts a new session family (a sign-in), or continues one when rotating. */
export async function issueAuthTokens(
  user: AuthUser,
  familyId: string = nanoid()
): Promise<AuthTokenPair> {
  ensureSecretsConfigured();
  const refreshJti = nanoid();

  await storeFamily(familyId, {
    session: { ...user, issuedAt: new Date().toISOString() },
    currentJti: refreshJti,
  });

  return {
    accessToken: buildAccessToken(user),
    refreshToken: buildRefreshToken(user, refreshJti, familyId),
    tokenType: 'Bearer',
    accessTokenTtlSeconds: ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTtlSeconds: REFRESH_TOKEN_TTL_SECONDS,
  };
}

export async function rotateRefreshToken(refreshToken: string): Promise<AuthTokenPair> {
  ensureSecretsConfigured();
  const decoded = verifyRefreshToken(refreshToken);

  const family = await getFamily(decoded.fid);
  if (!family || family.session.id !== decoded.sub) {
    throw new Error('Refresh token is revoked or expired');
  }

  // A deactivated Operator never gets new tokens, even if a refresh was already under way.
  if (await isDeactivatedOperator(family.session.id)) {
    await deleteFamily(decoded.fid);
    throw new Error('Operator is deactivated');
  }

  if (family.currentJti !== decoded.jti || !(await claimRefreshJti(decoded.jti))) {
    await deleteFamily(decoded.fid);
    logger.warn({ familyId: decoded.fid, sub: decoded.sub }, 'Refresh token reuse: family revoked');
    throw new Error('Refresh token was already used');
  }

  const { id, role, email, username } = family.session;
  return issueAuthTokens({ id, role, email, username }, decoded.fid);
}

/** Ends the whole session family the presented token belongs to, rotated or not. */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  try {
    await deleteFamily(verifyRefreshToken(refreshToken).fid);
  } catch (error) {
    logger.warn({ err: error }, 'Failed to revoke refresh token');
  }
}
