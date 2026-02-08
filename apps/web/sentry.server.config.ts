import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const sampleRate = Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1);
const tracesSampleRate = Number.isFinite(sampleRate) ? Math.min(1, Math.max(0, sampleRate)) : 0.1;

Sentry.init({
  dsn,
  environment:
    process.env.SENTRY_ENVIRONMENT ??
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
    process.env.NODE_ENV,
  tracesSampleRate,
  enableLogs: true,
  sendDefaultPii: false,
});
