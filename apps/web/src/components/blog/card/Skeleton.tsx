'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { BlogCardVariant } from './BlogCard';

export function BlogCardSkeleton({ variant = 'default' as BlogCardVariant }) {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="w-full aspect-[16/9]" />
      <div className={cn('p-6 space-y-3', variant === 'compact' && 'py-4')}>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <Skeleton className={cn('h-6', variant === 'default' ? 'w-3/4' : 'w-2/3')} />
        <Skeleton className="h-4 w-40" />
        {variant === 'default' && (
          <>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </>
        )}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-12 rounded" />
          <Skeleton className="h-5 w-12 rounded" />
          <Skeleton className="h-5 w-10 rounded" />
        </div>
      </div>
    </Card>
  );
}
