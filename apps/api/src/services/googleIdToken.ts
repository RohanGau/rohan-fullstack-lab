import { OAuth2Client } from 'google-auth-library';

export interface VerifiedGoogleIdentity {
  sub: string;
  email: string;
  emailVerified: boolean;
  nonce?: string;
}

/**
 * The single external boundary for Google sign-in. Verifies signature, issuer,
 * audience and expiry; tests replace this module.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<VerifiedGoogleIdentity> {
  const audience = process.env.GOOGLE_CLIENT_ID;
  if (!audience) throw new Error('GOOGLE_CLIENT_ID is not configured');

  const ticket = await new OAuth2Client(audience).verifyIdToken({ idToken, audience });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) throw new Error('Google token is missing identity claims');

  return {
    sub: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified === true,
    nonce: payload.nonce,
  };
}
