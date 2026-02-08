import type { Metadata } from 'next';
import ProjectListContent from '@/components/project/list/ProjectListContent';
import { getProjectList } from '@/lib/server/projectApi';
import type { ProjectsQueryRequired } from '@/types/project';
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

function parseProjectSearchParams(searchParams: SearchParams): ProjectsQueryRequired {
  const page = parsePositiveInt(pickOne(searchParams.page), 1);
  const perPage = parsePositiveInt(pickOne(searchParams.perPage), 9);
  const search = pickOne(searchParams.q)?.trim() || undefined;
  const featuredRaw = pickOne(searchParams.featured);
  const isFeatured = featuredRaw === 'true' ? true : featuredRaw === 'false' ? false : undefined;
  const sortFieldRaw = pickOne(searchParams.sortField);
  const sortField =
    sortFieldRaw === 'updatedAt' || sortFieldRaw === 'year' || sortFieldRaw === 'title'
      ? sortFieldRaw
      : 'createdAt';
  const sortOrder = pickOne(searchParams.sortOrder) === 'ASC' ? 'ASC' : 'DESC';
  const typesRaw = pickOne(searchParams.types);
  const types = typesRaw
    ? typesRaw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : undefined;

  return {
    page,
    perPage,
    search,
    types,
    isFeatured,
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
  const hasFilters = params.types || params.q || params.featured || params.sortField;

  // Build title
  let title = 'Projects';
  if (page > 1) title += ` - Page ${page}`;
  if (params.types) title += ` - ${pickOne(params.types)}`;

  return {
    title,
    description:
      'Portfolio of production-grade projects, open-source contributions, and side projects by Rohan Kumar.',
    alternates: {
      canonical: `${siteUrl}/project`, // Always canonical to main listing
    },
    robots: {
      // SEO: Only index page 1 without filters
      index: page === 1 && !hasFilters,
      follow: true,
    },
    openGraph: {
      title: 'Projects - Rohan Kumar',
      description: 'Portfolio of production-grade projects and open-source contributions.',
      url: `${siteUrl}/project`,
      type: 'website',
    },
  };
}

export default async function ProjectListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const initialQuery = parseProjectSearchParams(resolvedSearchParams);
  const { data, total } = await getProjectList(initialQuery);

  return <ProjectListContent initialQuery={initialQuery} initialResult={{ data, total }} />;
}
