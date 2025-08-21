import { cache } from 'react';
import { IBlogDto } from '@fullstack-lab/types';
import { apiFetchWithMeta, apiFetch } from '../apiClient';
import { API } from '../constant';
import { isMongoId } from '../utils';

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
    if (byId) return byId;
    return await getBlogBySlug(param, signal);
  }

  const bySlug = await getBlogBySlug(param, signal);
  if (bySlug) return bySlug;

  if (isMongoId(param)) {
    return await getBlogById(param, signal);
  }

  return null;
}

export const getBlogDetailCached = cache(getBlogDetail);
