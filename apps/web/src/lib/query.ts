import type { BlogsQueryRequired } from '@/types/blog';
import type { ProjectsQueryRequired } from '@/types/project';
import type { BaseQueryRequired, BlogFilter, ProjectFilter } from '@/types/query';

export type SearchParamValue = string | string[] | undefined;
export type SearchParamsRecord = Record<string, SearchParamValue>;

export function pickSearchParam(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function makeQueryStringFromFilter<F extends string>(
  q: BaseQueryRequired<F>,
  buildFilter: () => Record<string, unknown> | undefined
) {
  const { page, perPage, sort } = q;
  const params = new URLSearchParams({
    range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
    sort: JSON.stringify(sort),
  });
  const filter = buildFilter();
  if (filter && Object.keys(filter).length) {
    params.set('filter', JSON.stringify(filter));
  }
  return params.toString();
}

export function keyFromQuery<PickShape extends object>(
  ns: 'blogs' | 'projects',
  picked: PickShape
) {
  return `${ns}:${JSON.stringify(picked)}`;
}

export function makeBlogQueryString(q: BlogsQueryRequired) {
  return makeQueryStringFromFilter(q, () => {
    const filter: BlogFilter = {};
    if (q.search?.trim()) filter.q = q.search.trim();
    if (q.tags?.length) filter.tags = q.tags;
    if (typeof q.isFeatured === 'boolean') filter.isFeatured = q.isFeatured;
    if (q.status) filter.status = q.status;
    if (q.author?.trim()) filter.author = q.author.trim();
    return filter;
  });
}

export function blogKeyFromQuery(q: BlogsQueryRequired) {
  return keyFromQuery('blogs', {
    p: q.page,
    pp: q.perPage,
    s: q.sort,
    q: q.search ?? '',
    t: q.tags ?? [],
    f: q.isFeatured ?? null,
    st: q.status ?? 'published',
    a: q.author ?? '',
  });
}

export function makeProjectQueryString(q: ProjectsQueryRequired) {
  return makeQueryStringFromFilter(q, () => {
    const filter: ProjectFilter = {};
    if (q.search?.trim()) filter.q = q.search.trim();
    if (q.types?.length) filter.types = q.types;
    if (typeof q.isFeatured === 'boolean') filter.isFeatured = q.isFeatured;
    if (q.company?.trim()) filter.company = q.company.trim();
    if (q.role?.trim()) filter.role = q.role.trim();
    if (typeof q.year === 'number') filter.year = q.year;
    if (q.yearFrom != null) filter.yearFrom = q.yearFrom;
    if (q.yearTo != null) filter.yearTo = q.yearTo;
    return filter;
  });
}

export function projectKeyFromQuery(q: ProjectsQueryRequired) {
  return keyFromQuery('projects', {
    p: q.page,
    pp: q.perPage,
    s: q.sort,
    q: q.search ?? '',
    ty: q.types ?? [],
    f: q.isFeatured ?? null,
    c: q.company ?? '',
    r: q.role ?? '',
    y: q.year ?? null,
    yf: q.yearFrom ?? null,
    yt: q.yearTo ?? null,
  });
}
