import { notFound, permanentRedirect } from 'next/navigation';
import BlogDetail from '@/components/blog/detail';
import { getBlogDetailCached, getRelatedPostsCached } from '@/lib/server/blogApi';
import { stripMarkdown } from '@/lib/utils';
import { siteUrl } from '@/lib/constant';
import { BlogDetailPageProps } from '@/types/blog';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { BlogReadingTracker } from '@/components/blog/BlogReadingTracker';

// Required for Cloudflare Pages deployment
export const runtime = 'edge';
export const revalidate = 60;

export default async function BlogDetailPage(props: BlogDetailPageProps) {
  const { id } = await props.params;
  const raw = Array.isArray(id) ? id[0] : (id ?? '');
  const param = raw.trim();
  if (!param) notFound();

  const blog = await getBlogDetailCached(param);
  if (!blog || blog.status !== 'published') notFound();

  if (blog.slug && param !== blog.slug) {
    permanentRedirect(`/blog/${blog.slug}`);
  }

  // SEO: Fetch related posts for internal linking
  const relatedPosts = await getRelatedPostsCached(blog.id, blog.tags, 3);

  return (
    <>
      {/* Analytics: Track reading time and scroll depth */}
      <BlogReadingTracker blogTitle={blog.title} blogId={blog.id} />
      <BlogDetail blog={blog} />
      {/* SEO: Related posts for internal linking and topic clustering */}
      <RelatedPosts posts={relatedPosts} currentBlogTitle={blog.title} />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting', // SEO: BlogPosting is more specific than Article
            headline: blog.title,
            description: blog.summary || stripMarkdown(blog.content).slice(0, 160),
            author: blog.author ? { '@type': 'Person', name: blog.author } : undefined,
            datePublished: blog.publishedAt,
            dateModified: blog.updatedAt || blog.publishedAt,
            image: blog.coverImageUrl ? [blog.coverImageUrl] : undefined,
            keywords: blog.tags?.join(', '),
            mainEntityOfPage: `${siteUrl}/blog/${blog.slug ?? blog.id}`,
            publisher: {
              '@type': 'Organization',
              name: 'Rohan Kumar',
              logo: { '@type': 'ImageObject', url: `${siteUrl}/icon.png` },
            },
            // Additional BlogPosting-specific fields for Rich Results
            wordCount: stripMarkdown(blog.content).split(/\s+/).length,
            articleSection: blog.tags?.[0] || 'Technology',
            inLanguage: 'en-US',
          }),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Blog', item: `${siteUrl}/blog` },
              {
                '@type': 'ListItem',
                position: 2,
                name: blog.title,
                item: `${siteUrl}/blog/${blog.slug ?? blog.id}`,
              },
            ],
          }),
        }}
      />
    </>
  );
}
