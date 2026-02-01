import { validateSchema } from '../validation';
import { slotSchema, slotUpdateSchema } from '../validation/slot';
import Slot from '../models/Slot';
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

export const validateSlotCreate = validateSchema(slotSchema);
export const validateSlotUpdate = validateSchema(slotUpdateSchema);

const NS = 'slots';

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
    await sendAdminNotification({
      ...slot.toObject(),
      message: slot.message ?? undefined,
    });
  },
});

export const updateSlot = makeUpdateHandler({
  ns: NS,
  model: Slot,
  normalize: normalizeSlotBody,
  allowedFields: ['date', 'duration', 'message', 'status'],
  afterUpdate: async (slot) => {
    await sendUserNotification({
      email: slot.email,
      type: slot.status === 'cancelled' ? 'deleted' : 'updated',
      date: slot.date,
      duration: slot.duration,
      status: slot.status,
      message: slot.message ?? undefined,
    });
  },
});

export const deleteSlot = makeDeleteHandler({
  ns: NS,
  model: Slot,
  afterDelete: async (slot) => {
    await sendUserNotification({
      email: slot.email,
      type: 'deleted',
      date: slot.date,
      duration: slot.duration,
      status: 'cancelled',
      message: slot.message ?? undefined,
    });
  },
});
