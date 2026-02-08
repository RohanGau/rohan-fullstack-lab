import { AuthUser } from '@fullstack-lab/types';

declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
      user?: AuthUser;
      requestId?: string;
      idempotencyKey?: string;
    }
  }
}
