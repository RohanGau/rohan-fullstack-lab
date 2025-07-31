'use client';

import { useBlogs } from '@/hooks/useBlogs';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogListSkeleton } from '@/components/blog/BlogListSkeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function BlogListPage() {
  const { blogs, loading, error } = useBlogs();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Blogs</h1>
        <p className="text-muted-foreground text-sm">
          Thoughts, tutorials, and learnings from my engineering journey.
        </p>
      </div>

      {loading && <BlogListSkeleton />}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load blogs</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && blogs?.length === 0 && (
        <p className="text-muted-foreground">No blogs published yet.</p>
      )}

      {blogs && blogs.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}
