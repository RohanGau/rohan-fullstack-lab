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

const BLOG_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});

const BLOG_STATUS_VALUES = Object.freeze([
  BLOG_STATUS.DRAFT,
  BLOG_STATUS.PUBLISHED,
  BLOG_STATUS.ARCHIVED,
]);

const BLOG_LINK_KINDS = Object.freeze({
  REPO: 'repo',
  REF: 'ref',
  DEMO: 'demo',
  OTHER: 'other',
});

const BLOG_LINK_KIND_VALUES = Object.freeze([
  BLOG_LINK_KINDS.REPO,
  BLOG_LINK_KINDS.REF,
  BLOG_LINK_KINDS.DEMO,
  BLOG_LINK_KINDS.OTHER,
]);

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

const AGENT_POLICY_ACTIONS = Object.freeze({
  ALLOW: 'allow',
  CONFIRM: 'confirm',
  DENY: 'deny',
});

const AGENT_EXECUTION_STATUS = Object.freeze({
  SUCCESS: 'success',
  CONFIRMATION_REQUIRED: 'confirmation_required',
  DENIED: 'denied',
  ERROR: 'error',
});

const AGENT_CONFIRM_STATUS = Object.freeze({
  CONFIRMED: 'confirmed',
  NOT_FOUND: 'not_found',
  EXPIRED: 'expired',
  FORBIDDEN: 'forbidden',
});

const AGENT_DEFAULTS = Object.freeze({
  CONFIRM_TTL_SECONDS: 600,
});

const MCP_TOOL_NAMES = Object.freeze({
  BLOGS_CREATE_DRAFT: 'blogs_create_draft',
  BLOGS_LIST_RECENT: 'blogs_list_recent',
  BLOGS_PUBLISH_BLOG: 'blogs_publish_blog',
  BLOGS_GET_BY_ID_OR_SLUG: 'blogs_get_by_id_or_slug',
  BLOGS_UPDATE_DRAFT: 'blogs_update_draft',
  BLOGS_DELETE_DRAFT: 'blogs_delete_draft',
});

const MCP_DEFAULTS = Object.freeze({
  SERVER_NAME: 'rohan-fullstack-lab-mcp',
  SERVER_VERSION: '1.0.0',
  API_BASE_URL: 'http://localhost:5050/api/v1',
  BLOG_LIST_DEFAULT_LIMIT: 20,
  BLOG_LIST_MAX_LIMIT: 100,
});

const MCP_HEADERS = Object.freeze({
  ACTOR_ID: 'x-actor-id',
});

module.exports = {
  SLOT_EVENT_TYPES,
  SLOT_EVENT_TYPE_VALUES,
  EMAIL_DELIVERY_MODES,
  EMAIL_DELIVERY_MODE_VALUES,
  QUEUE_EVENT_SOURCES,
  EMAIL_QUEUE_DEFAULTS,
  API_VERSIONS,
  BLOG_STATUS,
  BLOG_STATUS_VALUES,
  BLOG_LINK_KINDS,
  BLOG_LINK_KIND_VALUES,
  AUTH_TOKEN_TYPES,
  AUTH_TOKEN_DEFAULTS,
  HTTP_HEADERS,
  MUTATION_HTTP_METHODS,
  AUDIT_LOG_DEFAULTS,
  AGENT_POLICY_ACTIONS,
  AGENT_EXECUTION_STATUS,
  AGENT_CONFIRM_STATUS,
  AGENT_DEFAULTS,
  MCP_TOOL_NAMES,
  MCP_DEFAULTS,
  MCP_HEADERS,
};
