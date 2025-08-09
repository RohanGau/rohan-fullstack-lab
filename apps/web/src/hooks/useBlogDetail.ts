import { useEffect, useMemo, useRef, useState } from 'react';
import { IBlogDto } from '@fullstack-lab/types';
import { API } from '@/lib/constant';
import { apiFetch, apiFetchWithMeta } from '@/lib/apiClient';
import { useBlogStore } from '@/lib/store/blogStore';

const isMongoId = (s: string) => /^[a-f\d]{24}$/i.test(s);

export function useBlogDetailParam(param: string) {
  const { detailsById, detailsBySlug, setDetailById, setDetailBySlug } = useBlogStore();

  const prefersId = isMongoId(param);
  const id   = prefersId ? param : undefined;
  const slug = prefersId ? undefined : param;

  const cached =
    (id && detailsById[id]) ||
    (slug && detailsBySlug[slug]) ||
    null;

  const [blog, setBlog] = useState<IBlogDto | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const qsForSlug = useMemo(() => {
    if (!slug) return '';
    const params = new URLSearchParams({
      range: JSON.stringify([0, 0]),
      sort: JSON.stringify(['publishedAt', 'DESC']),
      filter: JSON.stringify({ slug, status: 'published' }),
    });
    return params.toString();
  }, [slug]);

  // prevent re-trying same param on 404/network
  const triedRef = useRef<{ key: string; ok: boolean } | null>(null);

  // reset local state when param/cached changes
  useEffect(() => {
    setBlog(cached);
    setLoading(!cached);
    setError(null);
    triedRef.current = null;
  }, [param, cached]);

  useEffect(() => {
    if (!param || cached) return;

    // don't loop on a known bad key
    if (triedRef.current?.key === param && !triedRef.current.ok) return;

    const controller = new AbortController();

    const fetchById = async (theId: string) => {
      const item = await apiFetch<IBlogDto>(`${API.BLOGS}/${theId}`, { signal: controller.signal });
      if (item) {
        setDetailById(item.id, item);
        if (item.slug) setDetailBySlug(item.slug, item);
      }
      return item ?? null;
    };

    const fetchBySlug = async (theSlug: string) => {
      const { data: rows } = await apiFetchWithMeta<IBlogDto[]>(
        `${API.BLOGS}?${qsForSlug}`, { signal: controller.signal }
      );
      const item = rows?.[0] ?? null;
      if (item) {
        setDetailBySlug(theSlug, item);
        setDetailById(item.id, item);
      }
      return item;
    };

    const run = async () => {
      setLoading(true);
      try {
        let item: IBlogDto | null = null;

        if (prefersId && id) {
          item = await fetchById(id);
        } else if (slug) {
          item = await fetchBySlug(slug);
          // fallback: if not found but param could be an ID, try ID
          if (!item && isMongoId(param)) {
            item = await fetchById(param);
          }
        }

        const ok = !!item;
        triedRef.current = { key: param, ok };
        setBlog(item);
        setError(ok ? null : 'Not found');
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // ignore abort; do not set error
          return;
        }
        triedRef.current = { key: param, ok: false };
        setError(err?.message || err?.msg || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [param, prefersId, id, slug, qsForSlug, cached, setDetailById, setDetailBySlug]);

  return { blog, loading, error };
}
