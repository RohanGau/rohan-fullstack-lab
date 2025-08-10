import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API } from '@/lib/constant';
import { apiFetchWithMeta } from '@/lib/apiClient';
import { useProjectStore } from '@/lib/store/projectStore';
import type { IProjectDto } from '@fullstack-lab/types';
import type { ProjectsQuery, ProjectsQueryRequired } from '@/types/project';
import { makeProjectQueryString, projectKeyFromQuery } from '@/lib/utils';

export function useProjects(initial?: ProjectsQuery) {
  const [query, setQuery] = useState<ProjectsQuery>({
    page: 1,
    perPage: 8,
    sort: ['createdAt', 'DESC'],
    ...(initial ?? {}),
  });

  const page = query.page ?? 1,
    perPage = query.perPage ?? 8;
  const sort = (query.sort ?? ['createdAt', 'DESC']) as ProjectsQueryRequired['sort'];

  const { qs, cacheKey } = useMemo(() => {
    const q: ProjectsQueryRequired = { ...query, page, perPage, sort };
    return { qs: makeProjectQueryString(q), cacheKey: projectKeyFromQuery(q) };
  }, [query, page, perPage, sort]);

  const { listCache, setListCache } = useProjectStore();
  const cached = listCache[cacheKey];

  const [data, setData] = useState<IProjectDto[]>(cached?.data ?? []);
  const [total, setTotal] = useState<number>(cached?.total ?? 0);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const reqIdRef = useRef(0);
  const revalidatedKeysRef = useRef<Set<string>>(new Set());

  const fetcher = useCallback(
    async (signal?: AbortSignal) => {
      const reqId = ++reqIdRef.current;
      const { data, total } = await apiFetchWithMeta<IProjectDto[]>(`${API.PROJECTS}?${qs}`, {
        signal,
      });
      if (reqId !== reqIdRef.current) return;
      setData(data);
      setTotal(total);
      setError(null);
      setListCache(cacheKey, { data, total });
    },
    [qs, cacheKey, setListCache]
  );

  const refetch = useCallback(() => {
    const c = new AbortController();
    setLoading(true);
    fetcher(c.signal)
      .catch((e: any) => {
        if (e?.name !== 'AbortError') setError(e?.message || e?.msg || 'Failed to fetch projects');
      })
      .finally(() => setLoading(false));
  }, [fetcher]);

  useEffect(() => {
    if (cached) {
      setData(cached.data);
      setTotal(cached.total);
      setLoading(false);

      if (!revalidatedKeysRef.current.has(cacheKey)) {
        revalidatedKeysRef.current.add(cacheKey);
        const c = new AbortController();
        fetcher(c.signal).catch((e: any) => {
          if (e?.name !== 'AbortError')
            setError(e?.message || e?.msg || 'Failed to fetch projects');
        });
        return () => c.abort();
      }
      return;
    }

    const c = new AbortController();
    setLoading(true);
    fetcher(c.signal)
      .catch((e: any) => {
        if (e?.name !== 'AbortError') setError(e?.message || e?.msg || 'Failed to fetch projects');
      })
      .finally(() => setLoading(false));
    return () => c.abort();
  }, [cacheKey, cached, fetcher]);

  const pages = Math.max(1, Math.ceil(total / (query.perPage ?? 8)));

  return { data, total, pages, loading, error, query, setQuery, refetch };
}
