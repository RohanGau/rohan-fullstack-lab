import {
  captureRouterTransitionStart,
  consoleLoggingIntegration,
  init as initSentry,
} from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  const sampleRate = Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1);
  const tracesSampleRate = Number.isFinite(sampleRate) ? Math.min(1, Math.max(0, sampleRate)) : 0.1;

  initSentry({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate,
    enableLogs: true,
    integrations: [
      consoleLoggingIntegration({
        levels: ['warn', 'error'],
      }),
    ],
  });
}

export const onRouterTransitionStart = captureRouterTransitionStart;
