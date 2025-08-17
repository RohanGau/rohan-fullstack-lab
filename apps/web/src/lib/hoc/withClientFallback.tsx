'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { WithFallbackOptions } from '@/types/hoc';

export function withClientFallback<T extends object>(
  importer: () => Promise<{ default: React.ComponentType<T> }>,
  { fallback, errorFallback, ssr = false }: WithFallbackOptions
): React.ComponentType<T> {
  let Inner: React.ComponentType<T>;

  if (ssr) {
    const Lazy = React.lazy(importer);
    const SSRWrapped: React.FC<T> = (props) => (
      <ErrorBoundary fallback={errorFallback}>
        <React.Suspense fallback={fallback}>
          <Lazy {...props} />
        </React.Suspense>
      </ErrorBoundary>
    );
    SSRWrapped.displayName = 'WithClientFallback(SSR)';
    Inner = SSRWrapped;
  } else {
    const Lazy = dynamic(importer, {
      ssr: false,
      loading: () => <>{fallback}</>,
    });
    const CSRWrapped: React.FC<T> = (props) => (
      <ErrorBoundary fallback={errorFallback}>
        <React.Suspense fallback={fallback}>
          <Lazy {...props} />
        </React.Suspense>
      </ErrorBoundary>
    );
    CSRWrapped.displayName = 'WithClientFallback(CSR)';
    Inner = CSRWrapped;
  }

  const Wrapped: React.FC<T> = (props) => <Inner {...props} />;
  Wrapped.displayName = 'withClientFallback';
  return Wrapped;
}
