import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import User from '../models/User';
import logger from '../utils/logger';
import { validateSchema } from '../validation';
import {
  authLoginSchema,
  authLogoutSchema,
  authRefreshSchema,
  authTokenExchangeSchema,
} from '../validation/auth';
import { getAuthorizationToken } from '../middleware/requireAuth';
import {
  getLegacyAdminUser,
  isLegacyAdminToken,
  issueAuthTokens,
  revokeRefreshToken,
  rotateRefreshToken,
} from '../services/authTokens';

export const validateAuthLogin = validateSchema(authLoginSchema);
export const validateAuthTokenExchange = validateSchema(authTokenExchangeSchema);
export const validateAuthRefresh = validateSchema(authRefreshSchema);
export const validateAuthLogout = validateSchema(authLogoutSchema);

function resolveLegacyToken(req: Request): string {
  const headerToken = getAuthorizationToken(req);
  if (headerToken) return headerToken;
  return String(req.validatedBody?.token || req.body?.token || '');
}

export async function exchangeLegacyToken(req: Request, res: Response) {
  const token = resolveLegacyToken(req);

  if (!token || !isLegacyAdminToken(token)) {
    return res.status(401).json({ message: 'Unauthorized: Invalid admin token' });
  }

  try {
    const tokens = await issueAuthTokens(getLegacyAdminUser());
    res.status(200).json({
      ...tokens,
      role: 'admin',
      authMode: 'legacy-token-exchange',
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to exchange legacy admin token');
    res.status(500).json({ message: 'Failed to issue auth tokens' });
  }
}

export async function loginWithCredentials(req: Request, res: Response) {
  const { username, email, password } = req.validatedBody ?? {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : undefined;
  const normalizedUsername = typeof username === 'string' ? username.trim() : undefined;

  try {
    const user = await User.findOne(
      normalizedEmail ? { email: normalizedEmail } : { username: normalizedUsername }
    )
      .select('+password')
      .lean();

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tokens = await issueAuthTokens({
      id: String((user as any)._id),
      role: user.role,
      email: user.email,
      username: user.username,
    });

    res.status(200).json({
      ...tokens,
      role: user.role,
      authMode: 'user-credentials',
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to login with credentials');
    res.status(500).json({ message: 'Failed to authenticate user' });
  }
}

export async function refreshAccessToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.validatedBody;
    const tokens = await rotateRefreshToken(refreshToken);
    res.status(200).json(tokens);
  } catch (error) {
    logger.warn({ err: error }, 'Refresh token rotation failed');
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
}

export async function logoutSession(req: Request, res: Response) {
  try {
    const { refreshToken } = req.validatedBody;
    await revokeRefreshToken(refreshToken);
    res.status(204).send();
  } catch (error) {
    logger.warn({ err: error }, 'Logout token revocation failed');
    res.status(204).send();
  }
}

export async function getCurrentSession(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  res.status(200).json({
    id: req.user.id,
    role: req.user.role,
    email: req.user.email,
    username: req.user.username,
  });
}
