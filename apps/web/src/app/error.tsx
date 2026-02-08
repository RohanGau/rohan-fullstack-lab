'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { captureClientException } from '@/lib/monitoring/sentry';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    captureClientException(error, { tags: { boundary: 'global' } });
    console.error('Global error boundary:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
