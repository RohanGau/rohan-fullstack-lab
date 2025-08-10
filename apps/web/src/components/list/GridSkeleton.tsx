import { Skeleton } from '@/components/ui/skeleton';

export function GridSkeleton({ count = 9, image = true }: { count?: number; image?: boolean }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 p-4">
          {image && <Skeleton className="h-40 w-full" />}
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}
