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
  BLOG_NOT_FOUND: 'Blog not found',
  PROFILE_NOT_FOUND: 'Profile not found',
};

export const CMS_ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation failed',
  CREATE_FAILED: 'Resource creation failed',
  UPDATE_FAILED: 'Update failed',
  DELETE_FAILED: 'Delete failed',
  FETCH_FAILED: 'Fetching data failed',
  BLOG_NOT_FOUND: 'Blog not found',
  PROFILE_NOT_FOUND: 'Profile not found',
  TODO_NOT_FOUND: 'Todo not found',
  INVALID_ID_FOND: 'Invalid MongoDB ID received',
  TITLE_EXISTS: 'Title already exists',
};

export const CONTACT_ERROR_MESSAGES = {
  CREATION_FAILED: 'Contact creation failed',
  FETCH_FAILED: 'Failed to fetch contacts',
  DELETE_FAILED: 'Failed to delete contact',
};

export const PROJECT_ERROR_MESSAGES = {
  CREATE_FAILED: 'Project creation failed',
  INVALID_ID_FOND: 'Invalid project ID provided',
  PROJECT_NOT_FOUND: 'Project not found',
  UPDATE_FAILED: 'Project update failed',
  FETCH_FAILED: 'Failed to fetch project',
  DELETE_FAILED: 'Failed to delete project',
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

export function normalizeBody(body: any) {
  const out = { ...body };

  // Map single link -> links[]
  if (!out.links && out.link) {
    out.links = [{ url: out.link, kind: 'other' }];
    delete out.link;
  }

  // Map single type -> types[]
  if (!out.types && out.type) {
    out.types = [String(out.type).toLowerCase()];
    delete out.type;
  }

  // De-duplicate arrays where relevant
  if (Array.isArray(out.techStack)) {
    out.techStack = Array.from(new Set(out.techStack.map((s: string) => s.trim()).filter(Boolean)));
  }
  if (Array.isArray(out.features)) {
    out.features = Array.from(new Set(out.features.map((s: string) => s.trim()).filter(Boolean)));
  }
  if (Array.isArray(out.types)) {
    out.types = Array.from(new Set(out.types.map((s: string) => s.toLowerCase()).filter(Boolean)));
  }

  return out;
}

export function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}