// eslint-disable-next-line no-unused-vars
import { Request } from 'express';
declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
    }
  }
}
