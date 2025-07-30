import {
  Card,
  CardContent,
} from '@/components/ui/card';
import Link from 'next/link';

export function BlogsPreview() {
  return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Featured Blogs</h2>
          <Link href="/blog" className="text-sm text-primary hover:underline">Read all</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-lg font-semibold">Optimizing React Apps for Performance</h3>
              <p className="text-sm text-muted-foreground">
                Tips and strategies for improving the performance of large-scale React applications.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-lg font-semibold">The Art of Component Architecture</h3>
              <p className="text-sm text-muted-foreground">
                How to design scalable and maintainable component systems in modern frontend stacks.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
}