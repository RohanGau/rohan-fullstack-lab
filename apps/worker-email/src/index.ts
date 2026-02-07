import { SLOT_EVENT_TYPES, SLOT_EVENT_TYPE_VALUES } from '@fullstack-lab/constants';
import { sendAdminNotification, sendUserNotification } from './email';
import type { Env, MessageBatch, SlotEventType, SlotQueueEvent } from './types';

const slotEventTypeSet = new Set<string>(SLOT_EVENT_TYPE_VALUES);

function parseMessageBody(body: unknown): SlotQueueEvent {
  if (typeof body === 'string') {
    return JSON.parse(body) as SlotQueueEvent;
  }

  if (body && typeof body === 'object') {
    return body as SlotQueueEvent;
  }

  throw new Error('Unsupported queue message body');
}

function assertEventType(event: SlotQueueEvent): SlotEventType {
  if (slotEventTypeSet.has(event.type)) {
    return event.type as SlotEventType;
  }

  throw new Error(`Unsupported event type: ${(event as { type?: string }).type || 'unknown'}`);
}

function assertEnv(env: Env): void {
  const missing: string[] = [];
  if (!env.RESEND_API_KEY) missing.push('RESEND_API_KEY');
  if (!env.ADMIN_EMAIL) missing.push('ADMIN_EMAIL');
  if (!env.EMAIL_FROM) missing.push('EMAIL_FROM');

  if (missing.length > 0) {
    throw new Error(`Missing worker env var(s): ${missing.join(', ')}`);
  }
}

async function handleEvent(event: SlotQueueEvent, env: Env): Promise<void> {
  const type = assertEventType(event);

  switch (type) {
    case SLOT_EVENT_TYPES.BOOKED:
      await sendAdminNotification(event.data, env);
      return;
    case SLOT_EVENT_TYPES.UPDATED:
      await sendUserNotification(event.data, env, 'updated');
      return;
    case SLOT_EVENT_TYPES.DELETED:
      await sendUserNotification(event.data, env, 'deleted');
      return;
  }
}

export default {
  async queue(batch: MessageBatch, env: Env): Promise<void> {
    assertEnv(env);

    for (const message of batch.messages) {
      try {
        const event = parseMessageBody(message.body);
        await handleEvent(event, env);
        message.ack();
      } catch (error) {
        console.error('email-worker failed to process message', {
          messageId: message.id,
          attempts: message.attempts,
          error: error instanceof Error ? error.message : String(error),
        });
        message.retry();
      }
    }
  },
};
