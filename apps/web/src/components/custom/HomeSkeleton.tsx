import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function HomeSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-24">
      {/* Hero Skeleton */}
      <section className="bg-muted/30 rounded-xl p-10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-sm">
        <Skeleton className="rounded-xl w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60" />
        <div className="space-y-4 w-full max-w-xl">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </section>

      {/* Skills Skeleton */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Skills</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
