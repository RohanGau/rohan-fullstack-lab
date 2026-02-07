import type { SlotEventType, SlotQueueEvent, SlotQueuePayload } from '@fullstack-lab/types';

export type { SlotEventType, SlotQueueEvent, SlotQueuePayload };

export interface Env {
  RESEND_API_KEY: string;
  ADMIN_EMAIL: string;
  EMAIL_FROM: string;
}

export interface QueueMessage<TBody = unknown> {
  id: string;
  timestamp: Date;
  body: TBody;
  attempts: number;
  ack(): void;
  retry(): void;
}

export interface MessageBatch<TBody = unknown> {
  queue: string;
  messages: Array<QueueMessage<TBody>>;
}
