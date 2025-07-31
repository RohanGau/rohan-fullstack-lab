// components/blog/BlogListSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function BlogListSkeleton({ numberOfSkeletons = 9 }: { numberOfSkeletons?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: numberOfSkeletons }).map((_, idx) => (
        <div key={idx} className="space-y-3 p-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}
