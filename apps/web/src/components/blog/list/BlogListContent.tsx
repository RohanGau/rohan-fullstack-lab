/* eslint-disable no-unused-expressions, @typescript-eslint/no-unused-expressions */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BlogCard } from '@/components/blog/card/BlogCard';
import { BlogCardSkeleton } from '@/components/blog/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useBlogs } from '@/hooks/useBlogs';
import { useDebounced, SearchBox } from '@/components/list/SearchBox';
import { SortSelect, FeaturedSelect, PerPageSelect } from '@/components/list/Selects';
import { ChipToggleCloud } from '@/components/list/ChipToggleCloud';
import { Pager } from '@/components/list/Pager';
import { ResultsMeta } from '@/components/list/ResultsMeta';
import { arrToCsv, csvToArr } from '@/lib/utils';
import type { BlogsQueryRequired } from '@/types/blog';
import type { IBlogDto } from '@fullstack-lab/types';

type BlogListContentProps = {
  initialQuery?: BlogsQueryRequired;
  initialResult?: {
    data: IBlogDto[];
    total: number;
  };
};

function BlogListContent({ initialQuery, initialResult }: BlogListContentProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const initialFromSearchParams = useMemo(() => {
    const page = Number(sp.get('page') ?? 1);
    const perPage = Number(sp.get('perPage') ?? 9);
    const q = sp.get('q') ?? '';
    const tags = csvToArr(sp.get('tags'));
    const featured = sp.get('featured');
    const isFeatured = featured === 'true' ? true : featured === 'false' ? false : undefined;
    const status = (sp.get('status') as 'draft' | 'published' | 'archived' | null) ?? 'published';
    const sortField =
      (sp.get('sortField') as 'publishedAt' | 'createdAt' | 'updatedAt' | 'title' | null) ??
      'publishedAt';
    const sortOrder = (sp.get('sortOrder') as 'ASC' | 'DESC' | null) ?? 'DESC';
    return {
      page,
      perPage,
      search: q,
      tags,
      isFeatured,
      status,
      sort: [sortField, sortOrder] as any,
    };
  }, [sp]);

  const seededResult = useMemo(() => {
    if (!initialQuery || !initialResult) return undefined;
    return {
      query: initialQuery,
      data: initialResult.data,
      total: initialResult.total,
    };
  }, [initialQuery, initialResult]);

  const initial = initialQuery ?? initialFromSearchParams;
  const { data, total, pages, loading, error, query, setQuery } = useBlogs(initial, seededResult);
  const [search, setSearch] = useState(query.search ?? '');
  const debouncedSearch = useDebounced(search);

  // tag options from current page
  const tagOptions = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((b) => (b.tags ?? []).forEach((t) => set.add(t)));
    (query.tags ?? []).forEach((t) => set.add(t));
    return Array.from(set).sort();
  }, [data, query.tags]);

  // sync → URL
  useEffect(() => {
    const s = new URLSearchParams();
    s.set('page', String(query.page ?? 1));
    s.set('perPage', String(query.perPage ?? 9));
    if (query.search) s.set('q', query.search);
    if (query.tags?.length) s.set('tags', arrToCsv(query.tags));
    if (typeof query.isFeatured === 'boolean') s.set('featured', String(query.isFeatured));
    if (query.status) s.set('status', query.status);
    const [sf, so] = query.sort ?? ['publishedAt', 'DESC'];
    s.set('sortField', sf);
    s.set('sortOrder', so);
    router.replace(`/blog?${s.toString()}`);
  }, [router, query]);

  // debounce → query
  useEffect(() => {
    setQuery((q) => ({ ...q, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch, setQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Blogs</h1>
        <p className="text-muted-foreground text-sm">Thoughts, tutorials, and learnings.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchBox value={search} onChange={setSearch} placeholder="Search articles…" />
        <div className="flex gap-2">
          <SortSelect
            value={`${query.sort?.[0] ?? 'publishedAt'}:${query.sort?.[1] ?? 'DESC'}`}
            onChange={(v) => {
              const [field, order] = v.split(':') as any;
              setQuery((q) => ({ ...q, sort: [field, order], page: 1 }));
            }}
            options={[
              { label: 'Newest', value: 'publishedAt:DESC' },
              { label: 'Oldest', value: 'publishedAt:ASC' },
              { label: 'Title A–Z', value: 'title:ASC' },
              { label: 'Title Z–A', value: 'title:DESC' },
              { label: 'Recently Updated', value: 'updatedAt:DESC' },
            ]}
          />
          <FeaturedSelect
            value={
              typeof query.isFeatured === 'boolean'
                ? query.isFeatured
                  ? 'featured'
                  : 'non'
                : 'all'
            }
            onChange={(v) =>
              setQuery((q) => ({
                ...q,
                isFeatured: v === 'all' ? undefined : v === 'featured',
                page: 1,
              }))
            }
          />
          <PerPageSelect
            value={query.perPage ?? 9}
            onChange={(pp) => setQuery((q) => ({ ...q, perPage: pp, page: 1 }))}
          />
        </div>
      </div>

      <ChipToggleCloud
        options={tagOptions}
        active={query.tags ?? []}
        onToggle={(t) =>
          setQuery((q) => {
            const s = new Set(q.tags ?? []);
            s.has(t) ? s.delete(t) : s.add(t);
            return { ...q, tags: Array.from(s), page: 1 };
          })
        }
        onClear={() => setQuery((q) => ({ ...q, tags: [], page: 1 }))}
        prefix="#"
      />

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: query.perPage ?? 9 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && !loading && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load blogs</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (data?.length ?? 0) === 0 && (
        <p className="text-muted-foreground">No blogs found.</p>
      )}

      {!loading && !error && data?.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((b) => (
            <BlogCard key={b.id} blog={b} />
          ))}
        </div>
      ) : null}

      <Pager
        page={query.page ?? 1}
        pages={pages}
        onPrev={() => setQuery((q) => ({ ...q, page: Math.max(1, (q.page ?? 1) - 1) }))}
        onNext={() => setQuery((q) => ({ ...q, page: Math.min(pages, (q.page ?? 1) + 1) }))}
      />

      {!loading && !error && total > 0 && (
        <ResultsMeta page={query.page ?? 1} perPage={query.perPage ?? 9} total={total} />
      )}
    </div>
  );
}

export default BlogListContent;
