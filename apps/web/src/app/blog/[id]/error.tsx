'use client';

import { BlogErrorMessage } from '@/components/blog/BlogErrorMessage';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <BlogErrorMessage message={error?.message || 'Failed to load blog.'} onRetry={reset} />;
}
