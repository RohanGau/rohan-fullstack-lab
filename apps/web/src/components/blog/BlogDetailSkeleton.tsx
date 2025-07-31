import { Skeleton } from '@/components/ui/skeleton';

export function BlogDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-20 rounded" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
