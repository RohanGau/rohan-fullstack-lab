import type { IUserDb } from '../user';

export type AuthRole = IUserDb['role'];

export interface AuthUser {
  id: string;
  role: AuthRole;
  email?: string;
  username?: string;
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  accessTokenTtlSeconds: number;
  refreshTokenTtlSeconds: number;
}

export interface AccessTokenClaims {
  sub: string;
  role: AuthRole;
  email?: string;
  username?: string;
  tokenType: 'access';
  iat?: number;
  exp?: number;
  aud?: string | string[];
  iss?: string;
}

export interface RefreshTokenClaims {
  sub: string;
  role: AuthRole;
  tokenType: 'refresh';
  jti: string;
  iat?: number;
  exp?: number;
  aud?: string | string[];
  iss?: string;
}
