import { ErrorInfo, ReactNode } from 'react';
export type ErrorLike = unknown;

export type WithFallbackOptions = {
  /** what to render while loading */
  fallback: React.ReactNode;
  /** optional custom error UI for the boundary */
  errorFallback?: React.ReactNode;
  /** default false; set true if you want SSR for the child */
  ssr?: boolean;
};

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom UI for errors. Can be a node or a function receiving the error */
  fallback?: ReactNode | ((error: ErrorLike) => ReactNode);
  /** When any value in this array changes, the boundary resets */
  resetKeys?: Array<unknown>;
  /** Called when an error is caught */
  onError?: (error: ErrorLike, info: ErrorInfo) => void;
  /** Called when boundary resets due to resetKeys change or manual reset */
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: ErrorLike | null;
}
