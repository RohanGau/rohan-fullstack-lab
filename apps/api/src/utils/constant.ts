import process from 'process';

export const TODO_ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation Error',
  INVALID_JSON: 'Invalid JSON in request body',
  TITLE_EXISTS: 'Title already exists. Please choose a different title.',
  CREATE_FAILED: 'Failed to create todo',
  FETCH_FAILED: 'Failed to fetch todos',
  UPDATE_FAILED: 'Failed to update todo',
  DELETE_FAILED: 'Failed to delete todo',
  TODO_NOT_FOUND: 'Todo not found',
  INVALID_ID_FOND: 'Invalid ID found',
};

export const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  process.env.BACKEND_ORIGIN,
  process.env.NEXT_ORIGIN,
  process.env.ADMIN_ORIGIN,
  'https://rohan-admin-panel.pages.dev',
  'https://admin.rohangautam.dev',
  'http://localhost:3000',
  ...(process.env.NODE_ENV !== 'production'
    ? [
        'http://localhost:5174',
        'https://local.rohangautam.dev',
        'https://develop.rohan-admin-panel.pages.dev',
        'https://admin-stage.rohangautam.dev',
      ]
    : []),
  'http://localhost:5050',
].filter(Boolean) as string[];

const ADMIN_PAGES_PREVIEW_RE = /^https:\/\/([a-z0-9-]+\.)?rohan-admin-panel\.pages\.dev$/;

export function isAllowedOrigin(origin: string): boolean {
  if (allowedOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV !== 'production' && ADMIN_PAGES_PREVIEW_RE.test(origin)) {
    return true;
  }
  return false;
}

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
