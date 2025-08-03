'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function AboutSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <Card className="mb-10 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-4 w-80 mb-1" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Intro */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Top Skills */}
          <div>
            <Skeleton className="h-5 w-28 mb-2" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-24 rounded" />
              ))}
            </div>
          </div>

          {/* Extended Stack */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 rounded" />
              ))}
            </div>
          </div>

          <Separator />

          {/* Knowledge Areas */}
          <div>
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="h-5 w-24 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Philosophy */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Social Links */}
          <div className="flex gap-4 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-8 h-8 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Skeleton className="rounded-xl drop-shadow w-full max-w-md h-60" />
      </div>
    </div>
  );
}
