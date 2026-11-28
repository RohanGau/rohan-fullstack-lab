import type { Metadata } from 'next';
import { BLOG_STATUS, BLOG_STATUS_VALUES, isOneOf } from '@fullstack-lab/constants';
import BlogListContent from '@/components/blog/list/BlogListContent';
import { getBlogList } from '@/lib/server/blogApi';
import type { BlogsQueryRequired } from '@/types/blog';
import { siteUrl } from '@/lib/constant';
import { parsePositiveInt, pickSearchParam, type SearchParamsRecord } from '@/lib/query';

function parseBlogSearchParams(searchParams: SearchParamsRecord): BlogsQueryRequired {
  const page = parsePositiveInt(pickSearchParam(searchParams.page), 1);
  const perPage = parsePositiveInt(pickSearchParam(searchParams.perPage), 9);
  const search = pickSearchParam(searchParams.q)?.trim() || undefined;
  const statusRaw = pickSearchParam(searchParams.status);
  const status = isOneOf(BLOG_STATUS_VALUES, statusRaw) ? statusRaw : BLOG_STATUS.PUBLISHED;
  const featuredRaw = pickSearchParam(searchParams.featured);
  const isFeatured = featuredRaw === 'true' ? true : featuredRaw === 'false' ? false : undefined;
  const sortFieldRaw = pickSearchParam(searchParams.sortField);
  const sortField =
    sortFieldRaw === 'createdAt' || sortFieldRaw === 'updatedAt' || sortFieldRaw === 'title'
      ? sortFieldRaw
      : 'publishedAt';
  const sortOrder = pickSearchParam(searchParams.sortOrder) === 'ASC' ? 'ASC' : 'DESC';
  const tagsRaw = pickSearchParam(searchParams.tags);
  const tags = tagsRaw
    ? tagsRaw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : undefined;

  return {
    page,
    perPage,
    search,
    tags,
    isFeatured,
    status,
    sort: [sortField, sortOrder],
  };
}

export const runtime = 'edge';

// SEO: Canonical + noindex strategy for pagination and filters
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}): Promise<Metadata> {
  const params = await searchParams;
  const page = Number(pickSearchParam(params.page)) || 1;
  const hasFilters =
    params.tags || params.q || params.status || params.featured || params.sortField;

  // Build title
  let title = 'Blog';
  if (page > 1) title += ` - Page ${page}`;
  if (params.tags) title += ` - ${pickSearchParam(params.tags)}`;

  return {
    title,
    description:
      'Technical articles on frontend development, React, Next.js, TypeScript, system design, and software architecture by Rohan Kumar.',
    alternates: {
      canonical: `${siteUrl}/blog`, // Always canonical to main listing (no query params)
    },
    robots: {
      // SEO: Only index page 1 without filters to avoid duplicate content
      // All other pages (page=2+, filtered, sorted) are noindex but follow links
      index: page === 1 && !hasFilters,
      follow: true, // Always follow links to discover content
    },
    openGraph: {
      title: 'Blog - Rohan Kumar',
      description:
        'Technical articles on frontend development, React, Next.js, TypeScript, system design, and software architecture.',
      url: `${siteUrl}/blog`,
      type: 'website',
    },
  };
}

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const resolvedSearchParams = await searchParams;
  const initialQuery = parseBlogSearchParams(resolvedSearchParams);
  let data: Awaited<ReturnType<typeof getBlogList>>['data'] = [];
  let total = 0;
  try {
    const res = await getBlogList(initialQuery);
    data = res.data;
    total = res.total;
  } catch {
    data = [];
    total = 0;
  }

  return <BlogListContent initialQuery={initialQuery} initialResult={{ data, total }} />;
}
