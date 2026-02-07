import { validateSchema } from '../validation';
import { slotSchema, slotUpdateSchema } from '../validation/slot';
import Slot from '../models/Slot';
import {
  EMAIL_DELIVERY_MODES,
  EMAIL_DELIVERY_MODE_VALUES,
  SLOT_EVENT_TYPES,
} from '@fullstack-lab/constants';
import type { EmailDeliveryMode, SlotQueuePayload } from '@fullstack-lab/types';
import { normalizeSlotBody } from '../utils';
import {
  makeListHandler,
  makeGetByIdHandler,
  makeCreateHandler,
  makeUpdateHandler,
  makeDeleteHandler,
} from '../lib/controller';
import { buildSlotQuery } from '../utils';
import { sendAdminNotification, sendUserNotification } from '../services/email';
import { publishSlotEvent } from '../services/queue';
import logger from '../utils/logger';

export const validateSlotCreate = validateSchema(slotSchema);
export const validateSlotUpdate = validateSchema(slotUpdateSchema);

const NS = 'slots';
const emailDeliveryModeSet = new Set<string>(EMAIL_DELIVERY_MODE_VALUES);

function resolveEmailDeliveryMode(): EmailDeliveryMode {
  const raw = (process.env.EMAIL_DELIVERY_MODE || EMAIL_DELIVERY_MODES.SYNC).toLowerCase();

  if (emailDeliveryModeSet.has(raw)) {
    return raw as EmailDeliveryMode;
  }

  logger.warn(
    { mode: raw, allowedModes: EMAIL_DELIVERY_MODE_VALUES },
    'Invalid EMAIL_DELIVERY_MODE. Falling back to sync mode.'
  );
  return EMAIL_DELIVERY_MODES.SYNC;
}

const emailDeliveryMode = resolveEmailDeliveryMode();

function shouldQueue(mode: EmailDeliveryMode): boolean {
  return mode === EMAIL_DELIVERY_MODES.QUEUE || mode === EMAIL_DELIVERY_MODES.DUAL;
}

function shouldSendSync(mode: EmailDeliveryMode): boolean {
  return mode === EMAIL_DELIVERY_MODES.SYNC || mode === EMAIL_DELIVERY_MODES.DUAL;
}

function toISOStringSafe(dateLike: unknown): string {
  if (dateLike instanceof Date) return dateLike.toISOString();

  const parsed = new Date(String(dateLike));
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function toSlotQueuePayload(
  slot: any,
  statusOverride?: SlotQueuePayload['status']
): SlotQueuePayload {
  return {
    slotId: String(slot.id ?? slot._id),
    name: String(slot.name),
    email: String(slot.email),
    date: toISOStringSafe(slot.date),
    duration: Number(slot.duration ?? 30),
    status: statusOverride || (slot.status === 'cancelled' ? 'cancelled' : 'booked'),
    message: slot.message ?? undefined,
  };
}

export const getAllSlots = makeListHandler({
  ns: NS,
  model: Slot,
  buildQuery: buildSlotQuery,
  allowedSort: ['date', 'createdAt', 'name', 'email'],
});

export const getSlotById = makeGetByIdHandler({
  ns: NS,
  model: Slot,
});

export const createSlot = makeCreateHandler({
  ns: NS,
  model: Slot,
  normalize: normalizeSlotBody,
  allowedFields: ['name', 'email', 'date', 'duration', 'message', 'status'],
  afterCreate: async (slot) => {
    const payload = toSlotQueuePayload(slot, 'booked');

    if (shouldQueue(emailDeliveryMode)) {
      await publishSlotEvent(SLOT_EVENT_TYPES.BOOKED, payload, payload.slotId);
    }

    if (shouldSendSync(emailDeliveryMode)) {
      await sendAdminNotification({
        name: payload.name,
        email: payload.email,
        date: payload.date,
        duration: payload.duration,
        message: payload.message,
      });
    }
  },
});

export const updateSlot = makeUpdateHandler({
  ns: NS,
  model: Slot,
  normalize: normalizeSlotBody,
  allowedFields: ['date', 'duration', 'message', 'status'],
  afterUpdate: async (slot) => {
    const payload = toSlotQueuePayload(slot);
    const eventType =
      payload.status === 'cancelled' ? SLOT_EVENT_TYPES.DELETED : SLOT_EVENT_TYPES.UPDATED;
    const userNotificationType = payload.status === 'cancelled' ? 'deleted' : 'updated';

    if (shouldQueue(emailDeliveryMode)) {
      await publishSlotEvent(eventType, payload, payload.slotId);
    }

    if (shouldSendSync(emailDeliveryMode)) {
      await sendUserNotification({
        email: payload.email,
        type: userNotificationType,
        date: payload.date,
        duration: payload.duration,
        status: payload.status,
        message: payload.message,
      });
    }
  },
});

export const deleteSlot = makeDeleteHandler({
  ns: NS,
  model: Slot,
  afterDelete: async (slot) => {
    const payload = toSlotQueuePayload(slot, 'cancelled');

    if (shouldQueue(emailDeliveryMode)) {
      await publishSlotEvent(SLOT_EVENT_TYPES.DELETED, payload, payload.slotId);
    }

    if (shouldSendSync(emailDeliveryMode)) {
      await sendUserNotification({
        email: payload.email,
        type: 'deleted',
        date: payload.date,
        duration: payload.duration,
        status: payload.status,
        message: payload.message,
      });
    }
  },
});
