import nodemailer from 'nodemailer';
import { SlotNotificationFields, SlotUserNotificationFields } from '../types/email';
import { createCircuitBreaker } from '../lib/circuitBreaker';
import logger from '../utils/logger';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Core email sending function (without circuit breaker)
async function _sendAdminNotificationInternal({
  name,
  email,
  date,
  duration,
  message,
}: SlotNotificationFields): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
    logger.warn('Email not configured—admin notification skipped');
    return;
  }
  await transporter.sendMail({
    from: `"Slot Booking" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `📅 New Slot Booked: ${name}`,
    text: `
NEW SLOT BOOKED
---------------------
Name: ${name}
Email: ${email}
Date: ${date}
Duration: ${duration} minutes
Message: ${message || '(none)'}
    `.trim(),
  });
}

// Circuit breaker wrapped version
const adminNotificationBreaker = createCircuitBreaker(_sendAdminNotificationInternal, {
  name: 'sendAdminNotification',
  timeout: 10000, // 10 second timeout
  errorThresholdPercentage: 50, // Open after 50% failure rate
  resetTimeout: 30000, // Retry after 30 seconds
});

// Exported function with circuit breaker protection
export async function sendAdminNotification(fields: SlotNotificationFields): Promise<void> {
  try {
    await adminNotificationBreaker.fire(fields);
  } catch (error) {
    // Circuit breaker will handle failures gracefully
    // Don't throw - we don't want email failures to block slot booking
    logger.error(
      { error, name: fields.name, email: fields.email },
      'Admin notification failed, but slot booking succeeded'
    );
  }
}

// Core email sending function (without circuit breaker)
async function _sendUserNotificationInternal({
  email,
  type = 'updated',
  date,
  duration,
  status,
  message,
}: SlotUserNotificationFields & { status?: string; message?: string }): Promise<void> {
  let subject: string, text: string;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
    logger.warn('Email not configured—user notification skipped');
    return;
  }

  if (type === 'updated') {
    subject = 'Your booked slot was updated';
    text = `Your slot has been updated.
Status: ${status || 'N/A'}
Date: ${date}
Duration: ${duration} minutes.
${message ? '\nMessage: ' + message : ''}`;
  } else if (type === 'deleted' || status === 'cancelled') {
    subject = 'Your booked slot was cancelled';
    text = `Your slot was cancelled.
Status: cancelled
Date: ${date}
Duration: ${duration} minutes.
${message ? '\nReason: ' + message : ''}
If this was a mistake, please book again.`;
  } else {
    subject = 'Slot Notification';
    text = 'Notification about your slot booking.';
  }

  await transporter.sendMail({
    from: `"Slot Booking" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text,
  });
}

// Circuit breaker wrapped version
const userNotificationBreaker = createCircuitBreaker(_sendUserNotificationInternal, {
  name: 'sendUserNotification',
  timeout: 10000, // 10 second timeout
  errorThresholdPercentage: 50, // Open after 50% failure rate
  resetTimeout: 30000, // Retry after 30 seconds
});

// Exported function with circuit breaker protection
export async function sendUserNotification(
  fields: SlotUserNotificationFields & { status?: string; message?: string }
): Promise<void> {
  try {
    await userNotificationBreaker.fire(fields);
  } catch (error) {
    // Circuit breaker will handle failures gracefully
    // Don't throw - we don't want email failures to block slot updates
    logger.error(
      { error, email: fields.email, type: fields.type },
      'User notification failed, but slot operation succeeded'
    );
  }
}
