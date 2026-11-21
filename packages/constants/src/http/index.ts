export const HTTP_HEADERS = Object.freeze({
  REQUEST_ID: 'x-request-id',
  IDEMPOTENCY_KEY: 'idempotency-key',
  IDEMPOTENCY_STATUS: 'x-idempotency-status',
  API_VERSION: 'x-api-version',
} as const);

export const MUTATION_HTTP_METHODS = Object.freeze(['POST', 'PUT', 'PATCH', 'DELETE'] as const);

export type MutationHttpMethod = (typeof MUTATION_HTTP_METHODS)[number];
