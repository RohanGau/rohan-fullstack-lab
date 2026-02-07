import { nanoid } from 'nanoid';
import { QUEUE_EVENT_SOURCES } from '@fullstack-lab/constants';
import type { SlotEventType, SlotQueueEvent, SlotQueuePayload } from '@fullstack-lab/types';
import logger from '../utils/logger';

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4/accounts';
const CLOUDFLARE_API_TIMEOUT_MS = 7000;

function resolveQueueUrl(): string | null {
  if (process.env.CLOUDFLARE_QUEUE_URL) return process.env.CLOUDFLARE_QUEUE_URL;

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_R2_ACCOUNT_ID || '';
  const queueId = process.env.CLOUDFLARE_EMAIL_QUEUE_ID || process.env.CLOUDFLARE_QUEUE_ID || '';

  if (!accountId || !queueId) return null;

  return `${CLOUDFLARE_API_BASE}/${accountId}/queues/${queueId}/messages`;
}

function resolveQueueToken(): string | null {
  return process.env.CLOUDFLARE_QUEUE_TOKEN || process.env.CLOUDFLARE_API_TOKEN || null;
}

function toQueueEvent(
  eventType: SlotEventType,
  data: SlotQueuePayload,
  correlationId?: string
): SlotQueueEvent {
  return {
    id: nanoid(),
    correlationId: correlationId || data.slotId || nanoid(),
    type: eventType,
    source: QUEUE_EVENT_SOURCES.API,
    timestamp: new Date().toISOString(),
    data,
  };
}

function buildPayloadCandidates(rawEvent: string): string[] {
  return [
    // Current Cloudflare queues API shape (single message)
    JSON.stringify({
      body: rawEvent,
      content_type: 'text',
    }),
    // Alternate shape for account versions that accept message arrays
    JSON.stringify([
      {
        body: rawEvent,
        content_type: 'text',
      },
    ]),
    // Alternate shape used by some wrappers
    JSON.stringify({
      messages: [
        {
          body: rawEvent,
          content_type: 'text',
        },
      ],
    }),
  ];
}

async function postToQueue(queueUrl: string, queueToken: string, body: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLOUDFLARE_API_TIMEOUT_MS);

  try {
    return await fetch(queueUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${queueToken}`,
        'Content-Type': 'application/json',
      },
      body,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function publishSlotEvent(
  eventType: SlotEventType,
  data: SlotQueuePayload,
  correlationId?: string
): Promise<{ published: boolean; eventId: string }> {
  const queueUrl = resolveQueueUrl();
  const queueToken = resolveQueueToken();

  const event = toQueueEvent(eventType, data, correlationId);
  const serializedEvent = JSON.stringify(event);

  if (!queueUrl || !queueToken) {
    logger.warn(
      {
        eventId: event.id,
        eventType,
        hasQueueUrl: Boolean(queueUrl),
        hasQueueToken: Boolean(queueToken),
      },
      'Queue config missing. Event was not published.'
    );
    return { published: false, eventId: event.id };
  }

  const payloadCandidates = buildPayloadCandidates(serializedEvent);
  const failures: Array<{ status: number; responseBody: string }> = [];

  for (const payload of payloadCandidates) {
    try {
      const response = await postToQueue(queueUrl, queueToken, payload);

      if (response.ok) {
        logger.info({ eventId: event.id, eventType }, 'Event published to Cloudflare Queue');
        return { published: true, eventId: event.id };
      }

      failures.push({
        status: response.status,
        responseBody: await response.text(),
      });
    } catch (error) {
      logger.error({ err: error, eventId: event.id, eventType }, 'Queue publish request failed');
    }
  }

  logger.error(
    {
      eventId: event.id,
      eventType,
      queueUrl,
      failures,
    },
    'Failed to publish queue event after trying supported payload formats'
  );

  return { published: false, eventId: event.id };
}
