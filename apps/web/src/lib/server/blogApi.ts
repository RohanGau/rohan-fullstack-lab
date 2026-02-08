import { cache } from 'react';
import { IBlogDto } from '@fullstack-lab/types';
import { apiFetchWithMeta, apiFetch } from '../apiClient';
import { API } from '../constant';
import { isMongoId, makeBlogQueryString } from '../utils';
import type { BlogsQuery, BlogsQueryRequired } from '@/types/blog';

function normalizeBlogQuery(input: BlogsQuery = {}): BlogsQueryRequired {
  const page = Number.isFinite(input.page) && (input.page as number) > 0 ? Number(input.page) : 1;
  const perPage =
    Number.isFinite(input.perPage) && (input.perPage as number) > 0 ? Number(input.perPage) : 9;
  const sort = (input.sort ?? ['publishedAt', 'DESC']) as BlogsQueryRequired['sort'];

  return {
    ...input,
    page,
    perPage,
    sort,
    status: input.status ?? 'published',
  };
}

export async function getBlogList(input: BlogsQuery = {}): Promise<{
  query: BlogsQueryRequired;
  data: IBlogDto[];
  total: number;
}> {
  const query = normalizeBlogQuery(input);
  const qs = makeBlogQueryString(query);

  const { data, total } = await apiFetchWithMeta<IBlogDto[]>(`${API.BLOGS}?${qs}`, {
    next: { revalidate: 60 },
  });

  return { query, data, total };
}

export async function getBlogById(id: string, signal?: AbortSignal): Promise<IBlogDto | null> {
  try {
    return await apiFetch<IBlogDto>(`${API.BLOGS}/${id}`, { signal, next: { revalidate: 60 } });
  } catch (err) {
    if ((err as any).status === 400) return null;
    throw err;
  }
}

export async function getBlogBySlug(slug: string, signal?: AbortSignal): Promise<IBlogDto | null> {
  const param = new URLSearchParams({
    range: JSON.stringify([0, 0]),
    sort: JSON.stringify(['publishedAt', 'DESC']),
    filter: JSON.stringify({ slug, status: 'published' }),
  });
  try {
    const { data: rows } = await apiFetchWithMeta<IBlogDto[]>(`${API.BLOGS}?${param.toString()}`, {
      signal,
      next: { revalidate: 60 },
    });
    return rows?.[0] ?? null;
  } catch (err) {
    if ((err as any).status === 400) return null;
    throw err;
  }
}

export async function getBlogDetail(param: string, signal?: AbortSignal): Promise<IBlogDto | null> {
  if (!param) return null;

  if (isMongoId(param)) {
    const byId = await getBlogById(param, signal);
    return byId ?? (await getBlogBySlug(param, signal));
  }

  const bySlug = await getBlogBySlug(param, signal);
  return bySlug ?? null;
}

// Dedupes across page.tsx + generateMetadata in the same request
export const getBlogDetailCached = cache(getBlogDetail);
