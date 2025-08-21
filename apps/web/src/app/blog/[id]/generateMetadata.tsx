import { getBlogDetailCached } from '@/lib/server/blogApi';
import { stripMarkdown } from '@/lib/utils';
import { BlogDetailPageProps } from '@/types/blog';

export async function generateMetadata(props: BlogDetailPageProps) {
  const { id } = await props.params;
  const raw = Array.isArray(id) ? id[0] : (id ?? '');
  const param = raw.trim();

  if (!param) {
    return { title: 'Blog not found · Rohan Kumar', robots: { index: false, follow: false } };
  }

  const blog = await getBlogDetailCached(param);
  if (!blog) {
    return { title: 'Blog not found · Rohan Kumar', robots: { index: false, follow: false } };
  }

  const urlPath = `/blog/${blog.slug ?? blog.id}`;
  const desc = blog.summary?.trim()?.slice(0, 160) || stripMarkdown(blog.content).slice(0, 160);

  const images = blog.coverImageUrl ? [{ url: blog.coverImageUrl }] : undefined;
  const published = blog.publishedAt ? new Date(blog.publishedAt).toISOString() : undefined;
  const modified = blog.updatedAt ? new Date(blog.updatedAt).toISOString() : published;

  return {
    title: `${blog.title} · Rohan Kumar`,
    description: desc,
    alternates: { canonical: urlPath },
    robots:
      blog.status === 'published' ? { index: true, follow: true } : { index: false, follow: false },
    keywords: blog.tags,
    openGraph: {
      type: 'article',
      url: urlPath,
      title: blog.title,
      description: desc,
      images,
      locale: 'en_US',
      publishedTime: published,
      modifiedTime: modified,
      authors: blog.author ? [blog.author] : undefined,
      tags: blog.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: desc,
      images,
    },
  };
}
