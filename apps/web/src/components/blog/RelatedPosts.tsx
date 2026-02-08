import Link from 'next/link';
import { IBlogDto } from '@fullstack-lab/types';
import { BlogCard } from './card/BlogCard';

interface RelatedPostsProps {
  posts: IBlogDto[];
}

/**
 * Related Posts Component
 *
 * SEO Benefits:
 * - Internal linking improves crawl depth
 * - Establishes topic clusters
 * - Distributes page authority
 * - Reduces bounce rate
 * - Increases pageviews per session
 */
export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t pt-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Related Articles</h2>
        <p className="mt-2 text-muted-foreground">Continue exploring similar topics and insights</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} blog={post} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          View all articles →
        </Link>
      </div>
    </section>
  );
}
