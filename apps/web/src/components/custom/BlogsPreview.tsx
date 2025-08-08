import Link from 'next/link';
import { BlogCard } from '../blog/BlogCard';
import { BlogListSkeleton } from '../blog/BlogListSkeleton';
import { useFeaturedBlogs } from '@/hooks/useFeaturedBlogs';

export default function BlogsPreview() {
  const {
      featureBlogs,
      loading,
      error
    } = useFeaturedBlogs();
  
  if (loading) return <BlogListSkeleton numberOfSkeletons={3} />;
  if (error) {
    return (
      <div className="text-center text-red-500 py-12">
        <p>Failed to load blogs. Please try again later.</p>
        <p className="mt-2 text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Featured Blogs</h2>
        <Link href="/blog" className="text-sm text-primary hover:underline">Read all</Link>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
          {featureBlogs && featureBlogs.length > 0 ? (
            featureBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))
          ) : (
            <div className="text-center text-gray-500 py-12 col-span-2">No featured blogs found.</div>
          )}
        </div>
    </section>
  );
}