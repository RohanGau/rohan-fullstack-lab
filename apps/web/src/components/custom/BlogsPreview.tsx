import Link from 'next/link';
import type { IBlogDto } from '@fullstack-lab/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BlogCard } from '@/components/blog/card';

interface BlogsPreviewProps {
  blogs: IBlogDto[];
  error?: string | null;
}

export default function BlogsPreview({ blogs, error }: BlogsPreviewProps) {
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

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load blogs</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && blogs.length === 0 && (
        <div className="text-center text-muted-foreground py-12">No featured blogs found.</div>
      )}

      {!error && blogs.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {blogs.map((blog, idx) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              priorityImage={idx === 0}
              variant="default"
              showStatus={false}
            />
          ))}
        </div>
      )}
    </section>
  );
}
