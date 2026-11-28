import { BLOG_STATUS, stripMarkdown } from '@fullstack-lab/constants';
import { getBlogList } from '@/lib/server/blogApi';
import { siteUrl } from '@/lib/constant';

export const runtime = 'edge';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  let posts: Awaited<ReturnType<typeof getBlogList>>['data'] = [];
  try {
    const res = await getBlogList({
      page: 1,
      perPage: 50,
      status: BLOG_STATUS.PUBLISHED,
      sort: ['publishedAt', 'DESC'],
    });
    posts = res.data;
  } catch (err) {
    console.error('[rss.xml] Failed to fetch blog posts:', err);
  }

  const itemsXml = posts
    .map((post) => {
      const canonicalUrl = `${siteUrl}/blog/${post.slug || post.id}`;
      const plainSummary = stripMarkdown(post.summary?.trim() || post.content || '').slice(0, 300);
      const pubDate = new Date(post.publishedAt || post.createdAt).toUTCString();

      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(canonicalUrl)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(canonicalUrl)}</guid>`,
        `      <description>${escapeXml(plainSummary)}</description>`,
        `      <pubDate>${pubDate}</pubDate>`,
        post.author ? `      <author>${escapeXml(post.author)}</author>` : '',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const lastBuildDate =
    posts[0]?.publishedAt || posts[0]?.createdAt
      ? new Date(posts[0].publishedAt || posts[0].createdAt).toUTCString()
      : new Date().toUTCString();

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>Rohan Kumar Blog</title>',
    `    <link>${siteUrl}/blog</link>`,
    `    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />`,
    '    <description>Senior Software Engineer. Building clean, scalable web experiences.</description>',
    '    <language>en-us</language>',
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    itemsXml,
    '  </channel>',
    '</rss>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
