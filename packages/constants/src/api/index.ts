export const API_VERSIONS = Object.freeze({
  CURRENT: 'v1',
  CURRENT_PREFIX: '/api/v1',
  LEGACY_PREFIX: '/api',
} as const);

/**
 * Where each resource lives on the API. Clients (the admin panel, MCP, workers) take their
 * paths from here so a wrong or renamed path fails in one place. The API's own router mounts
 * should match this table.
 */
export const API_PATHS = Object.freeze({
  AUTH: `${API_VERSIONS.CURRENT_PREFIX}/auth`,
  BLOGS: `${API_VERSIONS.CURRENT_PREFIX}/blogs`,
  PROFILES: `${API_VERSIONS.CURRENT_PREFIX}/profiles`,
  /** Singular, unlike the others: this is how the API mounts it. */
  CONTACT: `${API_VERSIONS.CURRENT_PREFIX}/contact`,
  PROJECTS: `${API_VERSIONS.CURRENT_PREFIX}/projects`,
  UPLOADS: `${API_VERSIONS.CURRENT_PREFIX}/uploads`,
  SLOTS: `${API_VERSIONS.CURRENT_PREFIX}/slots`,
} as const);
