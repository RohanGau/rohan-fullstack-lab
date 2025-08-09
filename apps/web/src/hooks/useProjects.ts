'use client';
import { useEffect, useMemo, useState } from 'react';
import { IProjectDto } from '@fullstack-lab/types';
import { API } from '@/lib/constant';
import { apiFetchWithMeta } from '@/lib/apiClient';


export function useProjects(q: ProjectsQuery) {
  const page = q.page ?? 1, perPage = q.perPage ?? 8;
  const sort = q.sort ?? ['createdAt','DESC'];

  const [data,setData] = useState<IProjectDto[]>([]);
  const [total,setTotal] = useState(0);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState<string|null>(null);

  const qs = useMemo(() => {
    const params = new URLSearchParams({
      range: JSON.stringify([(page-1)*perPage, page*perPage-1]),
      sort: JSON.stringify(sort),
    });
    const filter: Record<string,any> = {};
    if (q.search?.trim()) filter.q = q.search.trim();
    if (q.types?.length)  filter.types = q.types;
    if (typeof q.isFeatured === 'boolean') filter.isFeatured = q.isFeatured;
    if (Object.keys(filter).length) params.set('filter', JSON.stringify(filter));
    return params.toString();
  }, [page,perPage,sort,q.search,q.types,q.isFeatured]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    apiFetchWithMeta<IProjectDto[]>(`${API.PROJECTS}?${qs}`, { signal: controller.signal })
      .then(({data,total}) => { setData(data); setTotal(total); setError(null); })
      .catch((err:any) => { if (err?.name!=='AbortError') setError(err?.msg||'Failed to fetch projects'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [qs]);

  const pages = Math.max(1, Math.ceil(total / perPage));
  return { data, total, pages, loading, error };
}
