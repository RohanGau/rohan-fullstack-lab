import process from 'process';
import { Request, Response, NextFunction } from 'express';
import { IUserDb } from '@fullstack-lab/types';
import { getLegacyAdminUser, isLegacyAdminToken, verifyAccessToken } from '../services/authTokens';
import logger from '../utils/logger';

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.replace('Bearer ', '').trim();
}

function isLegacyTokenAllowed() {
  return process.env.ENABLE_LEGACY_ADMIN_TOKEN !== 'false';
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
  }

  if (isLegacyTokenAllowed() && isLegacyAdminToken(token)) {
    req.user = getLegacyAdminUser();
    return next();
  }

  try {
    const user = verifyAccessToken(token);
    req.user = user;
    return next();
  } catch (error) {
    logger.warn({ err: error, path: req.originalUrl }, 'JWT authentication failed');
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
}

export function requireRole(...allowedRoles: IUserDb['role'][]) {
  const roleSet = new Set(allowedRoles);
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Missing user context' });
    }

    if (!req.user.role || !roleSet.has(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }

    return next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireAuth(req, res, (err?: unknown) => {
    if (err) return next(err as any);
    return requireRole('admin')(req, res, next);
  });
}

export function requireEditorOrAdmin(req: Request, res: Response, next: NextFunction) {
  return requireAuth(req, res, (err?: unknown) => {
    if (err) return next(err as any);
    return requireRole('admin', 'editor')(req, res, next);
  });
}

export function assertLegacyAdminToken(token: string): boolean {
  if (!isLegacyTokenAllowed()) return false;
  if (!process.env.ADMIN_TOKEN) return false;
  return token === process.env.ADMIN_TOKEN;
}

export function getAuthorizationToken(req: Request): string | null {
  return extractBearerToken(req);
}

export function getAdminTokenFromEnv(): string | null {
  if (!process.env.ADMIN_TOKEN) return null;
  return process.env.ADMIN_TOKEN;
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_TOKEN || process.env.JWT_ACCESS_SECRET);
}

export function isJwtConfigured(): boolean {
  return Boolean(process.env.JWT_ACCESS_SECRET || process.env.ADMIN_TOKEN);
}

export function isRefreshConfigured(): boolean {
  return Boolean(
    process.env.JWT_REFRESH_SECRET || process.env.JWT_ACCESS_SECRET || process.env.ADMIN_TOKEN
  );
}

export function getAuthMode(): 'jwt' | 'legacy' | 'mixed' | 'none' {
  const hasLegacy = Boolean(process.env.ADMIN_TOKEN);
  const hasJwt = Boolean(process.env.JWT_ACCESS_SECRET || process.env.JWT_REFRESH_SECRET);
  if (hasLegacy && hasJwt) return 'mixed';
  if (hasJwt) return 'jwt';
  if (hasLegacy) return 'legacy';
  return 'none';
}

export function shouldAllowLegacyAdminToken(): boolean {
  return isLegacyTokenAllowed();
}

export function setLegacyAdminUserOnRequest(req: Request): void {
  req.user = getLegacyAdminUser();
}

export function getCurrentUserRole(req: Request): IUserDb['role'] | undefined {
  return req.user?.role as IUserDb['role'] | undefined;
}

export function hasRole(req: Request, ...roles: IUserDb['role'][]): boolean {
  const role = getCurrentUserRole(req);
  if (!role) return false;
  return roles.includes(role);
}

export function ensureRole(req: Request, res: Response, ...roles: IUserDb['role'][]): boolean {
  if (!hasRole(req, ...roles)) {
    res.status(403).json({ message: 'Forbidden: Insufficient role' });
    return false;
  }
  return true;
}
