import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetchWithMeta } from '@/lib/apiClient';
import { API } from '@/lib/constant';
import { useBlogStore } from '@/lib/store/blogStore';
import type { IBlogDto } from '@fullstack-lab/types';
import type { BlogsQuery, BlogsQueryRequired } from '@/types/blog';
import { makeBlogQueryString, blogKeyFromQuery } from '@/lib/utils';
import { isAbort, getErrorMessage } from '@/lib/utils';

export function useBlogs(initial?: BlogsQuery) {
  const [query, setQuery] = useState<BlogsQuery>({
    page: 1,
    perPage: 9,
    sort: ['publishedAt', 'DESC'],
    status: 'published',
    ...(initial ?? {}),
  });

  const { qs, cacheKey } = useMemo(() => {
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 9;
    const sort = (query.sort ?? ['publishedAt', 'DESC']) as BlogsQueryRequired['sort'];

    const q: BlogsQueryRequired = { ...query, page, perPage, sort };
    return { qs: makeBlogQueryString(q), cacheKey: blogKeyFromQuery(q) };
  }, [query]);

  const { listCache, setListCache } = useBlogStore();
  const cached = listCache[cacheKey];

  const [data, setData] = useState<IBlogDto[]>(cached?.data ?? []);
  const [total, setTotal] = useState<number>(cached?.total ?? 0);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  // guards
  const reqIdRef = useRef(0);
  const revalidatedKeysRef = useRef<Set<string>>(new Set());

  const fetcher = useCallback(
    async (signal?: AbortSignal) => {
      const myReq = ++reqIdRef.current;
      const { data, total } = await apiFetchWithMeta<IBlogDto[]>(`${API.BLOGS}?${qs}`, { signal });
      if (myReq !== reqIdRef.current) return;
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
      .catch((err: unknown) => {
        if (!isAbort(err)) setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [fetcher]);

  useEffect(() => {
    // show cache immediately if present
    if (cached) {
      setData(cached.data);
      setTotal(cached.total);
      setLoading(false);

      // revalidate at most once per cacheKey
      if (!revalidatedKeysRef.current.has(cacheKey)) {
        revalidatedKeysRef.current.add(cacheKey);
        const c = new AbortController();
        fetcher(c.signal).catch((err: unknown) => {
          if (!isAbort(err)) setError(getErrorMessage(err));
        });
        return () => c.abort();
      }
      return; // cached and already revalidated
    }

    // no cache → blocking fetch
    const c = new AbortController();
    setLoading(true);
    fetcher(c.signal)
      .catch((err: unknown) => {
        if (!isAbort(err)) setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
    return () => c.abort();
  }, [cacheKey, cached, fetcher]);

  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / (query.perPage ?? 9))),
    [total, query.perPage]
  );

  return { data, total, pages, loading, error, query, setQuery, refetch };
}
