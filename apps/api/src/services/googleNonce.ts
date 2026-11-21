import { randomBytes } from 'node:crypto';
import { redisRest } from '../lib/redis-rest';

const NONCE_TTL_SECONDS = 5 * 60;
const NONCE_PREFIX = 'auth:google:nonce:';

const memoryNonces = new Map<string, number>();

function cleanupMemoryNonces(): void {
  const now = Date.now();
  for (const [nonce, expiresAt] of memoryNonces) {
    if (expiresAt <= now) memoryNonces.delete(nonce);
  }
}

/** Issues a one-time nonce the admin app must bind into its Google ID token. */
export async function issueGoogleNonce(): Promise<string> {
  const nonce = randomBytes(24).toString('base64url');

  if (redisRest) {
    await redisRest.set(NONCE_PREFIX + nonce, '1', { ex: NONCE_TTL_SECONDS });
  } else {
    cleanupMemoryNonces();
    memoryNonces.set(nonce, Date.now() + NONCE_TTL_SECONDS * 1000);
  }
  return nonce;
}

/** Atomically consumes a nonce. Returns true only the first time, and only before expiry. */
export async function consumeGoogleNonce(nonce: string): Promise<boolean> {
  if (redisRest) {
    return (await redisRest.getdel(NONCE_PREFIX + nonce)) !== null;
  }

  cleanupMemoryNonces();
  return memoryNonces.delete(nonce);
}
