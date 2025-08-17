'use client';

import { withClientFallback } from '@/lib/hoc/withClientFallback';
import { BlogCardSkeleton } from '@/components/blog/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const BlogList = withClientFallback(() => import('@/components/blog/list/BlogListContent'), {
  fallback: (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    </div>
  ),
  errorFallback: (
    <Alert variant="destructive">
      <AlertTitle>Failed to load blogs</AlertTitle>
      <AlertDescription>Something went wrong.</AlertDescription>
    </Alert>
  ),
  ssr: false,
});

export default function ProjectListPage() {
  return <BlogList />;
}
