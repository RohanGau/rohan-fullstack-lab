import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

export function requestTimeoutMiddleware(timeoutMs = 30_000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeoutHandle = setTimeout(() => {
      if (res.headersSent) return;

      logger.warn(
        { requestId: req.requestId, method: req.method, path: req.originalUrl, timeoutMs },
        'Request timed out'
      );
      res.status(408).json({
        error: 'REQUEST_TIMEOUT',
        message: `Request exceeded ${timeoutMs}ms timeout`,
        requestId: req.requestId,
      });
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeoutHandle));
    res.on('close', () => clearTimeout(timeoutHandle));

    next();
  };
}
