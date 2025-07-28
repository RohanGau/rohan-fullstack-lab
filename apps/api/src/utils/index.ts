import { ErrorRequestHandler } from '../types/express/error';
import { Request, Response, NextFunction } from 'express';
import logger from './logger'; // Adjust the import path as needed

export const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation Error',
  INVALID_JSON: 'Invalid JSON in request body',
  TITLE_EXISTS: 'Title already exists. Please choose a different title.',
  CREATE_FAILED: 'Failed to create todo',
  FETCH_FAILED: 'Failed to fetch todos',
  UPDATE_FAILED: 'Failed to update todo',
  DELETE_FAILED: 'Failed to delete todo',
  TODO_NOT_FOUND: 'Todo not found',
  INVALID_ID_FOND: 'Invalid ID found',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
};

export const jsonErrorHandler: ErrorRequestHandler = (err, _, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ msg: ERROR_MESSAGES.INVALID_JSON });
  }
  next();
};

// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err }, 'Global error :');
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  });
};
