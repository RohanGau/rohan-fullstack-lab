'use client';

import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { WithFallbackOptions } from "@/types/hoc";

export function withClientFallback<T extends object>(
  importer: () => Promise<{ default: React.ComponentType<T> }>,
  { fallback, errorFallback, ssr = false }: WithFallbackOptions
): React.ComponentType<T> {
  let Inner: React.ComponentType<T>;

  if (ssr) {
    // SSR path: use React.lazy + Suspense
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
    // Client-only path: use next/dynamic (built-in loading renderer)
    const Lazy = dynamic(importer, {
      ssr: false,
      loading: () => <>{fallback}</>,
    });
    const CSRWrapped: React.FC<T> = (props) => (
      <ErrorBoundary fallback={errorFallback}>
        <Lazy {...props} />
      </ErrorBoundary>
    );
    CSRWrapped.displayName = 'WithClientFallback(CSR)';
    Inner = CSRWrapped;
  }

  // keep a nice display name in React DevTools
  const Wrapped: React.FC<T> = (props) => <Inner {...props} />;
  Wrapped.displayName = 'withClientFallback';

  return Wrapped;
}