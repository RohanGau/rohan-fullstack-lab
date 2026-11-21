export const EMAIL_DELIVERY_MODES = Object.freeze({
  SYNC: 'sync',
  QUEUE: 'queue',
  DUAL: 'dual',
} as const);

export const EMAIL_DELIVERY_MODE_VALUES = Object.freeze([
  EMAIL_DELIVERY_MODES.SYNC,
  EMAIL_DELIVERY_MODES.QUEUE,
  EMAIL_DELIVERY_MODES.DUAL,
] as const);

export type EmailDeliveryModeValue = (typeof EMAIL_DELIVERY_MODE_VALUES)[number];

export const EMAIL_QUEUE_DEFAULTS = Object.freeze({
  PRIMARY: 'email-notifications-queue',
  DEAD_LETTER: 'email-notifications-dlq',
} as const);
