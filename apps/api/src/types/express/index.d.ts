import { AuthUser } from '@fullstack-lab/types';

declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
      user?: AuthUser;
      /** Set by requirePermission: who is asking and what they hold right now. */
      operator?: { id: string; email?: string; roles: string[]; permissions: string[] };
      requestId?: string;
      idempotencyKey?: string;
    }
  }
}
