import nodemailer from 'nodemailer';
import { SlotNotificationFields, SlotUserNotificationFields } from '../types/email';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendAdminNotification({
  name,
  email,
  date,
  duration,
  message,
}: SlotNotificationFields): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
    console.warn('Email not configured—email not sent.');
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

export async function sendUserNotification({
  email,
  type = 'updated',
  date,
  duration,
  status,
  message,
}: SlotUserNotificationFields & { status?: string; message?: string }): Promise<void> {
  let subject: string, text: string;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
    console.warn('Email not configured—email not sent.');
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
