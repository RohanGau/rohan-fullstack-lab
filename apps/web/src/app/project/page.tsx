import type { Metadata } from 'next';
import ProjectListContent from '@/components/project/list/ProjectListContent';
import { getProjectList } from '@/lib/server/projectApi';
import type { ProjectsQueryRequired } from '@/types/project';
import { siteUrl } from '@/lib/constant';
import { parsePositiveInt, pickSearchParam, type SearchParamsRecord } from '@/lib/query';

function parseProjectSearchParams(searchParams: SearchParamsRecord): ProjectsQueryRequired {
  const page = parsePositiveInt(pickSearchParam(searchParams.page), 1);
  const perPage = parsePositiveInt(pickSearchParam(searchParams.perPage), 9);
  const search = pickSearchParam(searchParams.q)?.trim() || undefined;
  const featuredRaw = pickSearchParam(searchParams.featured);
  const isFeatured = featuredRaw === 'true' ? true : featuredRaw === 'false' ? false : undefined;
  const sortFieldRaw = pickSearchParam(searchParams.sortField);
  const sortField =
    sortFieldRaw === 'updatedAt' || sortFieldRaw === 'year' || sortFieldRaw === 'title'
      ? sortFieldRaw
      : 'createdAt';
  const sortOrder = pickSearchParam(searchParams.sortOrder) === 'ASC' ? 'ASC' : 'DESC';
  const typesRaw = pickSearchParam(searchParams.types);
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
  searchParams: Promise<SearchParamsRecord>;
}): Promise<Metadata> {
  const params = await searchParams;
  const page = Number(pickSearchParam(params.page)) || 1;
  const hasFilters = params.types || params.q || params.featured || params.sortField;

  // Build title
  let title = 'Projects';
  if (page > 1) title += ` - Page ${page}`;
  if (params.types) title += ` - ${pickSearchParam(params.types)}`;

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
  searchParams: Promise<SearchParamsRecord>;
}) {
  const resolvedSearchParams = await searchParams;
  const initialQuery = parseProjectSearchParams(resolvedSearchParams);
  const { data, total } = await getProjectList(initialQuery);

  return <ProjectListContent initialQuery={initialQuery} initialResult={{ data, total }} />;
}
