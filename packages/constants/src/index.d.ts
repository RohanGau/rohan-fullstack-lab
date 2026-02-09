export declare const SLOT_EVENT_TYPES: {
  readonly BOOKED: 'SLOT_BOOKED';
  readonly UPDATED: 'SLOT_UPDATED';
  readonly DELETED: 'SLOT_DELETED';
};

export declare const SLOT_EVENT_TYPE_VALUES: readonly [
  typeof SLOT_EVENT_TYPES.BOOKED,
  typeof SLOT_EVENT_TYPES.UPDATED,
  typeof SLOT_EVENT_TYPES.DELETED,
];

export type SlotEventTypeValue = (typeof SLOT_EVENT_TYPE_VALUES)[number];

export declare const EMAIL_DELIVERY_MODES: {
  readonly SYNC: 'sync';
  readonly QUEUE: 'queue';
  readonly DUAL: 'dual';
};

export declare const EMAIL_DELIVERY_MODE_VALUES: readonly [
  typeof EMAIL_DELIVERY_MODES.SYNC,
  typeof EMAIL_DELIVERY_MODES.QUEUE,
  typeof EMAIL_DELIVERY_MODES.DUAL,
];

export type EmailDeliveryModeValue = (typeof EMAIL_DELIVERY_MODE_VALUES)[number];

export declare const QUEUE_EVENT_SOURCES: {
  readonly API: 'api';
};

export declare const EMAIL_QUEUE_DEFAULTS: {
  readonly PRIMARY: 'email-notifications-queue';
  readonly DEAD_LETTER: 'email-notifications-dlq';
};

export declare const API_VERSIONS: {
  readonly CURRENT: 'v1';
  readonly CURRENT_PREFIX: '/api/v1';
  readonly LEGACY_PREFIX: '/api';
};

export declare const BLOG_STATUS: {
  readonly DRAFT: 'draft';
  readonly PUBLISHED: 'published';
  readonly ARCHIVED: 'archived';
};

export declare const BLOG_STATUS_VALUES: readonly [
  typeof BLOG_STATUS.DRAFT,
  typeof BLOG_STATUS.PUBLISHED,
  typeof BLOG_STATUS.ARCHIVED,
];

export type BlogStatusValue = (typeof BLOG_STATUS_VALUES)[number];

export declare const BLOG_LINK_KINDS: {
  readonly REPO: 'repo';
  readonly REF: 'ref';
  readonly DEMO: 'demo';
  readonly OTHER: 'other';
};

export declare const BLOG_LINK_KIND_VALUES: readonly [
  typeof BLOG_LINK_KINDS.REPO,
  typeof BLOG_LINK_KINDS.REF,
  typeof BLOG_LINK_KINDS.DEMO,
  typeof BLOG_LINK_KINDS.OTHER,
];

export type BlogLinkKindValue = (typeof BLOG_LINK_KIND_VALUES)[number];

export declare const AUTH_TOKEN_TYPES: {
  readonly ACCESS: 'access';
  readonly REFRESH: 'refresh';
};

export declare const AUTH_TOKEN_DEFAULTS: {
  readonly ISSUER: 'rohan-fullstack-lab';
  readonly AUDIENCE: 'rohan-fullstack-lab-admin';
  readonly ACCESS_TTL: '15m';
  readonly REFRESH_TTL: '7d';
};

export declare const HTTP_HEADERS: {
  readonly REQUEST_ID: 'x-request-id';
  readonly IDEMPOTENCY_KEY: 'idempotency-key';
  readonly IDEMPOTENCY_STATUS: 'x-idempotency-status';
  readonly API_VERSION: 'x-api-version';
};

export declare const MUTATION_HTTP_METHODS: readonly ['POST', 'PUT', 'PATCH', 'DELETE'];

export type MutationHttpMethod = (typeof MUTATION_HTTP_METHODS)[number];

export declare const AUDIT_LOG_DEFAULTS: {
  readonly MAX_CHANGED_FIELDS: 50;
  readonly MAX_QUERY_KEYS: 20;
  readonly MAX_USER_AGENT_LENGTH: 256;
  readonly MAX_PATH_LENGTH: 512;
};

export declare const AGENT_POLICY_ACTIONS: {
  readonly ALLOW: 'allow';
  readonly CONFIRM: 'confirm';
  readonly DENY: 'deny';
};

export type AgentPolicyActionValue =
  (typeof AGENT_POLICY_ACTIONS)[keyof typeof AGENT_POLICY_ACTIONS];

export declare const AGENT_EXECUTION_STATUS: {
  readonly SUCCESS: 'success';
  readonly CONFIRMATION_REQUIRED: 'confirmation_required';
  readonly DENIED: 'denied';
  readonly ERROR: 'error';
};

export type AgentExecutionStatusValue =
  (typeof AGENT_EXECUTION_STATUS)[keyof typeof AGENT_EXECUTION_STATUS];

export declare const AGENT_CONFIRM_STATUS: {
  readonly CONFIRMED: 'confirmed';
  readonly NOT_FOUND: 'not_found';
  readonly EXPIRED: 'expired';
  readonly FORBIDDEN: 'forbidden';
};

export type AgentConfirmStatusValue =
  (typeof AGENT_CONFIRM_STATUS)[keyof typeof AGENT_CONFIRM_STATUS];

export declare const AGENT_DEFAULTS: {
  readonly CONFIRM_TTL_SECONDS: 600;
};

export declare const MCP_TOOL_NAMES: {
  readonly BLOGS_CREATE_DRAFT: 'blogs_create_draft';
  readonly BLOGS_LIST_RECENT: 'blogs_list_recent';
  readonly BLOGS_PUBLISH_BLOG: 'blogs_publish_blog';
  readonly BLOGS_GET_BY_ID_OR_SLUG: 'blogs_get_by_id_or_slug';
  readonly BLOGS_UPDATE_DRAFT: 'blogs_update_draft';
  readonly BLOGS_DELETE_DRAFT: 'blogs_delete_draft';
};

export type McpToolNameValue = (typeof MCP_TOOL_NAMES)[keyof typeof MCP_TOOL_NAMES];

export declare const MCP_DEFAULTS: {
  readonly SERVER_NAME: 'rohan-fullstack-lab-mcp';
  readonly SERVER_VERSION: '1.0.0';
  readonly API_BASE_URL: 'http://localhost:5050/api/v1';
  readonly BLOG_LIST_DEFAULT_LIMIT: 20;
  readonly BLOG_LIST_MAX_LIMIT: 100;
};

export declare const MCP_HEADERS: {
  readonly ACTOR_ID: 'x-actor-id';
};
