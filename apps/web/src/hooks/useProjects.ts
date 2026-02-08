'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API } from '@/lib/constant';
import { apiFetchWithMeta } from '@/lib/apiClient';
import { useProjectStore } from '@/lib/store/projectStore';
import type { IProjectDto } from '@fullstack-lab/types';
import type { ProjectsQuery, ProjectsQueryRequired } from '@/types/project';
import { makeProjectQueryString, projectKeyFromQuery, getErrorMessage, isAbort } from '@/lib/utils';

type InitialProjectsResult = {
  query: ProjectsQueryRequired;
  data: IProjectDto[];
  total: number;
};

export function useProjects(initial?: ProjectsQuery, initialResult?: InitialProjectsResult) {
  const [query, setQuery] = useState<ProjectsQuery>({
    page: 1,
    perPage: 8,
    sort: ['createdAt', 'DESC'],
    ...(initial ?? {}),
  });

  // Derive all query parts here so deps are stable
  const { qs, cacheKey } = useMemo(() => {
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 8;
    const sort = (query.sort ?? ['createdAt', 'DESC']) as ProjectsQueryRequired['sort'];

    const q: ProjectsQueryRequired = { ...query, page, perPage, sort };
    return { qs: makeProjectQueryString(q), cacheKey: projectKeyFromQuery(q) };
  }, [query]);

  const { listCache, setListCache } = useProjectStore();
  const cached = listCache[cacheKey];
  const seededCache = useMemo(() => {
    if (!initialResult) return null;
    const seededKey = projectKeyFromQuery(initialResult.query);
    if (seededKey !== cacheKey) return null;
    return { data: initialResult.data, total: initialResult.total };
  }, [cacheKey, initialResult]);
  const cacheSnapshot = cached ?? seededCache;

  const [data, setData] = useState<IProjectDto[]>(cacheSnapshot?.data ?? []);
  const [total, setTotal] = useState<number>(cacheSnapshot?.total ?? 0);
  const [loading, setLoading] = useState(!cacheSnapshot);
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

  useEffect(() => {
    if (!cached && seededCache) {
      setListCache(cacheKey, seededCache);
    }
  }, [cacheKey, cached, seededCache, setListCache]);

  const refetch = useCallback(() => {
    const c = new AbortController();
    setLoading(true);
    fetcher(c.signal)
      .catch((e: unknown) => {
        if (!isAbort(e)) setError(getErrorMessage(e));
      })
      .finally(() => setLoading(false));
  }, [fetcher]);

  useEffect(() => {
    const resolvedCache = cached ?? seededCache;
    if (resolvedCache) {
      setData(resolvedCache.data);
      setTotal(resolvedCache.total);
      setLoading(false);

      if (!revalidatedKeysRef.current.has(cacheKey)) {
        revalidatedKeysRef.current.add(cacheKey);
        const c = new AbortController();
        fetcher(c.signal).catch((e: unknown) => {
          if (!isAbort(e)) setError(getErrorMessage(e));
        });
        return () => c.abort();
      }
      return;
    }

    const c = new AbortController();
    setLoading(true);
    fetcher(c.signal)
      .catch((e: unknown) => {
        if (!isAbort(e)) setError(getErrorMessage(e));
      })
      .finally(() => setLoading(false));
    return () => c.abort();
  }, [cacheKey, cached, seededCache, fetcher]);

  const pages = Math.max(1, Math.ceil(total / (query.perPage ?? 8)));

  return { data, total, pages, loading, error, query, setQuery, refetch };
}
