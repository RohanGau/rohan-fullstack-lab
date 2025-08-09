'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProjectDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <Card>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-10/12" />
          <Skeleton className="h-4 w-9/12" />
        </CardContent>
      </Card>
    </div>
  );
}
