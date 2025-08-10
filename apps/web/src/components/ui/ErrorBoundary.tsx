'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { ErrorBoundaryState, ErrorBoundaryProps, ErrorLike } from '@/types/hoc';

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: ErrorLike): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info);
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (!this.state.hasError) return;

    const { resetKeys = [] } = this.props;
    const prev = prevProps.resetKeys ?? [];
    if (resetKeys.length !== prev.length ||
        resetKeys.some((k, i) => Object.is(k, prev[i]) === false)) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? (this.props.fallback as (e: ErrorLike) => ReactNode)(this.state.error)
          : this.props.fallback;
      }
      const message =
        (this.state.error as any)?.message ??
        (typeof this.state.error === 'string' ? this.state.error : 'Unexpected error');

      return (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
