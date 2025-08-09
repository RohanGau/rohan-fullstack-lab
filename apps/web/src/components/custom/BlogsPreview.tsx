'use client';

import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BlogCard, BlogCardSkeleton } from '@/components/blog/card';
import { useFeaturedBlogs } from '@/hooks/useFeaturedBlogs';

export default function BlogsPreview() {
  const { featureBlogs, loading, error } = useFeaturedBlogs(3);

  return (
    <section aria-labelledby="featured-blogs">
      <div className="flex items-center justify-between mb-6">
        <h2 id="featured-blogs" className="text-2xl font-semibold">
          Featured Blogs
        </h2>
        <Link href="/blog" className="text-sm text-primary hover:underline">
          Read all
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1, 2].map((i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load blogs</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty */}
      {!loading && !error && (!featureBlogs || featureBlogs.length === 0) && (
        <div className="text-center text-muted-foreground py-12">
          No featured blogs found.
        </div>
      )}

      {/* List */}
      {!loading && !error && featureBlogs && featureBlogs.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featureBlogs.map((blog, idx) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              priorityImage={idx === 0}   // boost LCP for first card
              variant="default"
              showStatus={false}
            />
          ))}
        </div>
      )}
    </section>
  );
}
