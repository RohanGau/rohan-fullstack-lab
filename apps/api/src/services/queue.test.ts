import { afterEach, describe, expect, it, vi } from 'vitest';
import { SLOT_EVENT_TYPES } from '@fullstack-lab/constants';
import type { SlotQueuePayload } from '@fullstack-lab/types';
import { publishSlotEvent } from './queue';

const originalEnv = { ...process.env };
const originalFetch = global.fetch;

const payload: SlotQueuePayload = {
  slotId: 'slot_123',
  name: 'Rohan Kumar',
  email: 'rohan@example.com',
  date: '2026-02-07T00:00:00.000Z',
  duration: 30,
  status: 'booked',
  message: 'Need discussion about architecture.',
};

afterEach(() => {
  process.env = { ...originalEnv };
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('publishSlotEvent', () => {
  it('returns published=false when queue config is missing', async () => {
    delete process.env.CLOUDFLARE_QUEUE_URL;
    delete process.env.CLOUDFLARE_QUEUE_TOKEN;
    delete process.env.CLOUDFLARE_API_TOKEN;
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_EMAIL_QUEUE_ID;
    delete process.env.CLOUDFLARE_QUEUE_ID;
    delete process.env.CLOUDFLARE_R2_ACCOUNT_ID;

    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof global.fetch;

    const result = await publishSlotEvent(SLOT_EVENT_TYPES.BOOKED, payload);

    expect(result.published).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('publishes successfully when queue URL and token are configured', async () => {
    process.env.CLOUDFLARE_QUEUE_URL =
      'https://api.cloudflare.com/client/v4/accounts/test-account/queues/email/messages';
    process.env.CLOUDFLARE_QUEUE_TOKEN = 'test-token';

    const fetchSpy = vi.fn<
      (input: string | URL | Request, init?: RequestInit) => Promise<Response>
    >(async () => new Response('{}', { status: 200 }));
    global.fetch = fetchSpy as unknown as typeof global.fetch;

    const result = await publishSlotEvent(SLOT_EVENT_TYPES.UPDATED, payload, payload.slotId);

    expect(result.published).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      process.env.CLOUDFLARE_QUEUE_URL,
      expect.objectContaining({ method: 'POST' })
    );
  });
});
