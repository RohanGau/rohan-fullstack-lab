'use client';

import { useReportWebVitals } from 'next/web-vitals';
import type { NextWebVitalsMetric } from 'next/app';
import { captureWebVitalMetric } from '@/lib/monitoring/sentry';

function sendMetricToEndpoint(metric: NextWebVitalsMetric): void {
  const endpoint = process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT;
  if (!endpoint) return;
  const runtimeMetric = metric as NextWebVitalsMetric & {
    delta?: number;
    rating?: string;
    navigationType?: string;
  };

  const payload = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: runtimeMetric.delta,
    rating: runtimeMetric.rating,
    label: metric.label,
    navigationType: runtimeMetric.navigationType,
    path: window.location.pathname,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, payload);
    return;
  }

  void fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  });
}

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    const runtimeMetric = metric as NextWebVitalsMetric & { rating?: string };
    captureWebVitalMetric(metric);
    sendMetricToEndpoint(metric);

    if (process.env.NODE_ENV !== 'production') {
      console.info('[web-vitals]', metric.name, metric.value, runtimeMetric.rating);
    }
  });

  return null;
}
