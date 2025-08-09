'use client';

import { BlogCardSkeleton } from '@/components/blog/card';

export function BlogListSkeleton({ numberOfSkeletons = 9 }: { numberOfSkeletons?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: numberOfSkeletons }).map((_, idx) => (
        <BlogCardSkeleton key={idx} />
      ))}
    </div>
  );
}
