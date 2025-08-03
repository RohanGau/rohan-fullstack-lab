'use client';

import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { WithFallbackOptions } from "@/types/hoc";

export function withClientFallback<T extends object>(
    importer: () => Promise<{ default: React.ComponentType<T> }>,
    options: WithFallbackOptions
): React.ComponentType<T> {
    const LazyComponent = dynamic(importer, {
        ssr: false,
        loading: () => <>{options.fallback}</>,
    });

    const Wrapped = (props: T) => (
        <ErrorBoundary>
            <Suspense fallback={options.fallback}>
                <LazyComponent {...props} />
            </Suspense>
        </ErrorBoundary>
    )
    Wrapped.displayName = "withClientFallback";
    return Wrapped;
}