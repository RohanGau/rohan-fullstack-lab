import type { Env, SlotQueuePayload } from './types';

const RESEND_EMAIL_API = 'https://api.resend.com/emails';

interface ResendEmailPayload {
  from: string;
  to: string | string[];
  subject: string;
  text: string;
}

async function sendResendEmail(payload: ResendEmailPayload, env: Env): Promise<void> {
  const response = await fetch(RESEND_EMAIL_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API failed with status ${response.status}: ${body}`);
  }
}

function formatDate(dateIso: string): string {
  const parsed = new Date(dateIso);
  if (Number.isNaN(parsed.getTime())) return dateIso;
  return parsed.toISOString();
}

export async function sendAdminNotification(payload: SlotQueuePayload, env: Env): Promise<void> {
  const text = [
    'NEW SLOT BOOKED',
    '---------------------',
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Date: ${formatDate(payload.date)}`,
    `Duration: ${payload.duration} minutes`,
    `Message: ${payload.message || '(none)'}`,
    `Status: ${payload.status}`,
    `Slot ID: ${payload.slotId}`,
  ].join('\n');

  await sendResendEmail(
    {
      from: env.EMAIL_FROM,
      to: env.ADMIN_EMAIL,
      subject: `New Slot Booked: ${payload.name}`,
      text,
    },
    env
  );
}

export async function sendUserNotification(
  payload: SlotQueuePayload,
  env: Env,
  type: 'updated' | 'deleted'
): Promise<void> {
  const subject =
    type === 'updated' ? 'Your booked slot was updated' : 'Your booked slot was cancelled';
  const messageLabel = type === 'updated' ? 'Message' : 'Reason';

  const lines = [
    type === 'updated' ? 'Your slot has been updated.' : 'Your slot was cancelled.',
    `Status: ${payload.status}`,
    `Date: ${formatDate(payload.date)}`,
    `Duration: ${payload.duration} minutes.`,
  ];

  if (payload.message) {
    lines.push(`${messageLabel}: ${payload.message}`);
  }

  if (type === 'deleted') {
    lines.push('If this was a mistake, please book again.');
  }

  await sendResendEmail(
    {
      from: env.EMAIL_FROM,
      to: payload.email,
      subject,
      text: lines.join('\n'),
    },
    env
  );
}
