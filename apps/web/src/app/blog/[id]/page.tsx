import { notFound, permanentRedirect } from 'next/navigation';
import BlogDetail from '@/components/blog/detail';
import { getBlogDetailCached } from '@/lib/server/blogApi';
import { stripMarkdown } from '@/lib/utils';
import { siteUrl } from '@/lib/constant';
import { BlogDetailPageProps } from '@/types/blog';

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

  return (
    <>
      <BlogDetail blog={blog} />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
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
