import BlogListContent from '@/components/blog/list/BlogListContent';
import { getBlogList } from '@/lib/server/blogApi';
import type { BlogsQueryRequired } from '@/types/blog';

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
