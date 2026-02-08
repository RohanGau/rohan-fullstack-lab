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
