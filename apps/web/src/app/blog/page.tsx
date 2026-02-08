import type { Metadata } from 'next';
import BlogListContent from '@/components/blog/list/BlogListContent';
import { getBlogList } from '@/lib/server/blogApi';
import type { BlogsQueryRequired } from '@/types/blog';
import { siteUrl } from '@/lib/constant';

type SearchParamValue = string | string[] | undefined;
type SearchParams = Record<string, SearchParamValue>;

function pickOne(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function parseBlogSearchParams(searchParams: SearchParams): BlogsQueryRequired {
  const page = parsePositiveInt(pickOne(searchParams.page), 1);
  const perPage = parsePositiveInt(pickOne(searchParams.perPage), 9);
  const search = pickOne(searchParams.q)?.trim() || undefined;
  const statusRaw = pickOne(searchParams.status);
  const status =
    statusRaw === 'draft' || statusRaw === 'archived' || statusRaw === 'published'
      ? statusRaw
      : 'published';
  const featuredRaw = pickOne(searchParams.featured);
  const isFeatured = featuredRaw === 'true' ? true : featuredRaw === 'false' ? false : undefined;
  const sortFieldRaw = pickOne(searchParams.sortField);
  const sortField =
    sortFieldRaw === 'createdAt' || sortFieldRaw === 'updatedAt' || sortFieldRaw === 'title'
      ? sortFieldRaw
      : 'publishedAt';
  const sortOrder = pickOne(searchParams.sortOrder) === 'ASC' ? 'ASC' : 'DESC';
  const tagsRaw = pickOne(searchParams.tags);
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
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const page = Number(pickOne(params.page)) || 1;
  const hasFilters =
    params.tags || params.q || params.status || params.featured || params.sortField;

  // Build title
  let title = 'Blog';
  if (page > 1) title += ` - Page ${page}`;
  if (params.tags) title += ` - ${pickOne(params.tags)}`;

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
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const initialQuery = parseBlogSearchParams(resolvedSearchParams);
  const { data, total } = await getBlogList(initialQuery);

  return <BlogListContent initialQuery={initialQuery} initialResult={{ data, total }} />;
}
