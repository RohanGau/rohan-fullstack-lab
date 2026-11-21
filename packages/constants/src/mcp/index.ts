export const MCP_TOOL_NAMES = Object.freeze({
  BLOGS_CREATE_DRAFT: 'blogs_create_draft',
  BLOGS_LIST_RECENT: 'blogs_list_recent',
  BLOGS_PUBLISH_BLOG: 'blogs_publish_blog',
  BLOGS_GET_BY_ID_OR_SLUG: 'blogs_get_by_id_or_slug',
  BLOGS_UPDATE_DRAFT: 'blogs_update_draft',
  BLOGS_DELETE_DRAFT: 'blogs_delete_draft',
} as const);

export type McpToolNameValue = (typeof MCP_TOOL_NAMES)[keyof typeof MCP_TOOL_NAMES];

export const MCP_DEFAULTS = Object.freeze({
  SERVER_NAME: 'rohan-fullstack-lab-mcp',
  SERVER_VERSION: '1.0.0',
  API_BASE_URL: 'http://localhost:5050/api/v1',
  BLOG_LIST_DEFAULT_LIMIT: 20,
  BLOG_LIST_MAX_LIMIT: 100,
} as const);

export const MCP_HEADERS = Object.freeze({
  ACTOR_ID: 'x-actor-id',
} as const);
