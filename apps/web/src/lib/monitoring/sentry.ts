import type { NextWebVitalsMetric } from 'next/app';
import * as Sentry from '@sentry/nextjs';

function hasSentryDsn(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
}

export function captureClientException(error: unknown, context?: Sentry.CaptureContext): void {
  if (!hasSentryDsn()) return;
  Sentry.captureException(error, context);
}

export function captureWebVitalMetric(metric: NextWebVitalsMetric): void {
  if (!hasSentryDsn()) return;
  const runtimeMetric = metric as NextWebVitalsMetric & {
    delta?: number;
    rating?: string;
    navigationType?: string;
  };

  Sentry.captureMessage(`web-vital:${metric.name}`, {
    level: 'info',
    tags: {
      metric_name: metric.name,
      metric_label: metric.label,
      metric_rating: runtimeMetric.rating,
    },
    extra: {
      id: metric.id,
      value: metric.value,
      delta: runtimeMetric.delta,
      navigationType: runtimeMetric.navigationType,
    },
  });
}
