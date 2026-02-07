import type { SlotStatus } from '../slot';

export type SlotEventType = 'SLOT_BOOKED' | 'SLOT_UPDATED' | 'SLOT_DELETED';

export type QueueEventSource = 'api';

export type EmailDeliveryMode = 'sync' | 'queue' | 'dual';

export interface SlotQueuePayload {
  slotId: string;
  name: string;
  email: string;
  date: string;
  duration: number;
  status: SlotStatus;
  message?: string;
}

export interface QueueEvent<TType extends string, TData> {
  id: string;
  correlationId: string;
  type: TType;
  source: QueueEventSource;
  timestamp: string;
  data: TData;
}

export type SlotQueueEvent = QueueEvent<SlotEventType, SlotQueuePayload>;
