import type { Request, Response } from 'express';
import Operator from '../models/Operator';
import { issueAuthTokens } from '../services/authTokens';
import { verifyGoogleIdToken } from '../services/googleIdToken';
import { consumeGoogleNonce, issueGoogleNonce } from '../services/googleNonce';

const REFUSED = { message: 'Sign-in refused' };

export async function signInWithGoogle(req: Request, res: Response): Promise<void> {
  const { idToken, nonce } = req.body ?? {};
  if (typeof idToken !== 'string' || !idToken || typeof nonce !== 'string' || !nonce) {
    res.status(400).json({ message: 'idToken and nonce are required' });
    return;
  }

  if (!(await consumeGoogleNonce(nonce))) {
    res.status(401).json(REFUSED);
    return;
  }

  let identity;
  try {
    identity = await verifyGoogleIdToken(idToken);
  } catch {
    res.status(401).json(REFUSED);
    return;
  }

  if (!identity.emailVerified || identity.nonce !== nonce) {
    res.status(401).json(REFUSED);
    return;
  }

  // Known Google account first; otherwise claim an Operator that has no account bound yet.
  // The claim is one atomic update so two first logins can't both bind.
  const operator =
    (await Operator.findOne({ googleSub: identity.sub })) ??
    (await Operator.findOneAndUpdate(
      { email: identity.email.toLowerCase(), googleSub: { $exists: false } },
      { $set: { googleSub: identity.sub } },
      { new: true }
    ));
  if (!operator) {
    res.status(401).json(REFUSED);
    return;
  }

  // TODO(cycle 5): resolve real Role names; 'admin' is a stopgap until AuthUser carries Roles.
  const tokens = await issueAuthTokens({ id: operator.id, role: 'admin', email: operator.email });
  res.status(200).json(tokens);
}

export async function createGoogleNonce(_req: Request, res: Response): Promise<void> {
  const nonce = await issueGoogleNonce();
  res.status(200).json({ nonce });
}
