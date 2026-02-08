const SLOT_EVENT_TYPES = Object.freeze({
  BOOKED: 'SLOT_BOOKED',
  UPDATED: 'SLOT_UPDATED',
  DELETED: 'SLOT_DELETED',
});

const SLOT_EVENT_TYPE_VALUES = Object.freeze([
  SLOT_EVENT_TYPES.BOOKED,
  SLOT_EVENT_TYPES.UPDATED,
  SLOT_EVENT_TYPES.DELETED,
]);

const EMAIL_DELIVERY_MODES = Object.freeze({
  SYNC: 'sync',
  QUEUE: 'queue',
  DUAL: 'dual',
});

const EMAIL_DELIVERY_MODE_VALUES = Object.freeze([
  EMAIL_DELIVERY_MODES.SYNC,
  EMAIL_DELIVERY_MODES.QUEUE,
  EMAIL_DELIVERY_MODES.DUAL,
]);

const QUEUE_EVENT_SOURCES = Object.freeze({
  API: 'api',
});

const EMAIL_QUEUE_DEFAULTS = Object.freeze({
  PRIMARY: 'email-notifications-queue',
  DEAD_LETTER: 'email-notifications-dlq',
});

const API_VERSIONS = Object.freeze({
  CURRENT: 'v1',
  CURRENT_PREFIX: '/api/v1',
  LEGACY_PREFIX: '/api',
});

const AUTH_TOKEN_TYPES = Object.freeze({
  ACCESS: 'access',
  REFRESH: 'refresh',
});

const AUTH_TOKEN_DEFAULTS = Object.freeze({
  ISSUER: 'rohan-fullstack-lab',
  AUDIENCE: 'rohan-fullstack-lab-admin',
  ACCESS_TTL: '15m',
  REFRESH_TTL: '7d',
});

const HTTP_HEADERS = Object.freeze({
  REQUEST_ID: 'x-request-id',
  IDEMPOTENCY_KEY: 'idempotency-key',
  IDEMPOTENCY_STATUS: 'x-idempotency-status',
  API_VERSION: 'x-api-version',
});

const MUTATION_HTTP_METHODS = Object.freeze(['POST', 'PUT', 'PATCH', 'DELETE']);

const AUDIT_LOG_DEFAULTS = Object.freeze({
  MAX_CHANGED_FIELDS: 50,
  MAX_QUERY_KEYS: 20,
  MAX_USER_AGENT_LENGTH: 256,
  MAX_PATH_LENGTH: 512,
});

module.exports = {
  SLOT_EVENT_TYPES,
  SLOT_EVENT_TYPE_VALUES,
  EMAIL_DELIVERY_MODES,
  EMAIL_DELIVERY_MODE_VALUES,
  QUEUE_EVENT_SOURCES,
  EMAIL_QUEUE_DEFAULTS,
  API_VERSIONS,
  AUTH_TOKEN_TYPES,
  AUTH_TOKEN_DEFAULTS,
  HTTP_HEADERS,
  MUTATION_HTTP_METHODS,
  AUDIT_LOG_DEFAULTS,
};
