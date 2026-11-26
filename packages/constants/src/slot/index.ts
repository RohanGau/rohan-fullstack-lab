export const SLOT_STATUS = Object.freeze({
  BOOKED: 'booked',
  CANCELLED: 'cancelled',
} as const);

export const SLOT_STATUS_VALUES = Object.freeze([
  SLOT_STATUS.BOOKED,
  SLOT_STATUS.CANCELLED,
] as const);

export const SLOT_EVENT_TYPES = Object.freeze({
  BOOKED: 'SLOT_BOOKED',
  UPDATED: 'SLOT_UPDATED',
  DELETED: 'SLOT_DELETED',
} as const);

export const SLOT_EVENT_TYPE_VALUES = Object.freeze([
  SLOT_EVENT_TYPES.BOOKED,
  SLOT_EVENT_TYPES.UPDATED,
  SLOT_EVENT_TYPES.DELETED,
] as const);

export type SlotEventTypeValue = (typeof SLOT_EVENT_TYPE_VALUES)[number];
