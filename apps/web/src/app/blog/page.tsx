'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BlogCard } from '@/components/blog/card/BlogCard';
import { BlogCardSkeleton } from '@/components/blog/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBlogs } from '@/hooks/useBlogs';

/* -------------------------------
   Small debounce hook
-------------------------------- */
function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* -------------------------------
   CSV helpers for URL params
-------------------------------- */
const arrToCsv = (a?: string[]) => (a && a.length ? a.join(',') : '');
const csvToArr = (s?: string | null) =>
  (s?.split(',').map(x => x.trim()).filter(Boolean) ?? []);

/* -------------------------------
   Simple Pager (Prev / Next)
-------------------------------- */
function Pager({
  page, pages, onPrev, onNext,
}: {
  page: number; pages: number;
  onPrev: () => void; onNext: () => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={onPrev}
        aria-label="Previous page"
      >
        Prev
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {pages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= pages}
        onClick={onNext}
        aria-label="Next page"
      >
        Next
      </Button>
    </div>
  );
}

/* -------------------------------
   Page
-------------------------------- */
export default function BlogListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initial state from URL
  const initial = useMemo(() => {
    const page = Number(searchParams.get('page') ?? 1);
    const perPage = Number(searchParams.get('perPage') ?? 9);
    const q = searchParams.get('q') ?? '';
    const tags = csvToArr(searchParams.get('tags'));
    const featured = searchParams.get('featured');
    const isFeatured = featured === 'true' ? true : featured === 'false' ? false : undefined;
    const status = (searchParams.get('status') as 'draft'|'published'|'archived' | null) ?? 'published';
    const sortField = (searchParams.get('sortField') as 'publishedAt'|'createdAt'|'updatedAt'|'title' | null) ?? 'publishedAt';
    const sortOrder = (searchParams.get('sortOrder') as 'ASC'|'DESC' | null) ?? 'DESC';
    return {
      page,
      perPage,
      search: q,
      tags,
      isFeatured,
      status: status ?? 'published',
      sort: [sortField, sortOrder] as ['publishedAt'|'createdAt'|'updatedAt'|'title','ASC'|'DESC'],
    };
  }, [searchParams]);

  // Hook with initial query
  const { data, total, pages, loading, error, query, setQuery } = useBlogs(initial);

  // Local UI (debounced search)
  const [search, setSearch] = useState(query.search ?? '');
  const debouncedSearch = useDebounced(search);

  // Derive tag options from current page’s data
  const tagOptions = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach(b => (b.tags ?? []).forEach(t => set.add(t)));
    (query.tags ?? []).forEach(t => set.add(t));
    return Array.from(set).sort();
  }, [data, query.tags]);

  // Sync query → URL
  useEffect(() => {
    const sp = new URLSearchParams();
    sp.set('page', String(query.page ?? 1));
    sp.set('perPage', String(query.perPage ?? 9));
    if (query.search) sp.set('q', query.search);
    if (query.tags?.length) sp.set('tags', arrToCsv(query.tags));
    if (typeof query.isFeatured === 'boolean') sp.set('featured', String(query.isFeatured));
    if (query.status) sp.set('status', query.status);
    const [sf, so] = query.sort ?? ['publishedAt','DESC'];
    sp.set('sortField', sf);
    sp.set('sortOrder', so);
    router.replace(`/blog?${sp.toString()}`);
  }, [router, query]);

  // Apply debounced search to hook
  useEffect(() => {
    setQuery(q => ({ ...q, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch, setQuery]);

  // Handlers
  const toggleTag = (t: string) =>
    setQuery(q => {
      const curr = new Set(q.tags ?? []);
      curr.has(t) ? curr.delete(t) : curr.add(t);
      return { ...q, tags: Array.from(curr), page: 1 };
    });

  const clearTags = () => setQuery(q => ({ ...q, tags: [], page: 1 }));

  const changeSort = (value: string) => {
    const [field, order] = value.split(':') as ['publishedAt'|'createdAt'|'updatedAt'|'title','ASC'|'DESC'];
    setQuery(q => ({ ...q, sort: [field, order], page: 1 }));
  };

  const changePage = (p: number) => setQuery(q => ({ ...q, page: p }));

  const changePerPage = (pp: number) => setQuery(q => ({ ...q, perPage: pp, page: 1 }));

  const toggleFeatured = (v: 'all' | 'featured' | 'non') =>
    setQuery(q => ({
      ...q,
      isFeatured: v === 'all' ? undefined : v === 'featured',
      page: 1,
    }));

  // UI
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Blogs</h1>
        <p className="text-muted-foreground text-sm">
          Thoughts, tutorials, and learnings from my engineering journey.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: Search */}
        <div className="flex-1">
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Right: Sort / Featured / Per page */}
        <div className="flex gap-2">
          <Select
            value={`${(query.sort?.[0] ?? 'publishedAt')}:${(query.sort?.[1] ?? 'DESC')}`}
            onValueChange={changeSort}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="publishedAt:DESC">Newest</SelectItem>
              <SelectItem value="publishedAt:ASC">Oldest</SelectItem>
              <SelectItem value="title:ASC">Title A–Z</SelectItem>
              <SelectItem value="title:DESC">Title Z–A</SelectItem>
              <SelectItem value="updatedAt:DESC">Recently Updated</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={
              typeof query.isFeatured === 'boolean'
                ? query.isFeatured ? 'featured' : 'non'
                : 'all'
            }
            onValueChange={toggleFeatured}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Featured" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="non">Non-featured</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={String(query.perPage ?? 9)}
            onValueChange={(v) => changePerPage(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="9">9</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="18">18</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tag Chips (derived) */}
      {tagOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tagOptions.map((t) => {
            const active = (query.tags ?? []).includes(t);
            return (
              <Badge
                key={t}
                variant={active ? 'default' : 'secondary'}
                className="cursor-pointer select-none"
                onClick={() => toggleTag(t)}
              >
                #{t}
              </Badge>
            );
          })}
          {(query.tags?.length ?? 0) > 0 && (
            <Button variant="ghost" size="sm" onClick={clearTags}>
              Clear tags
            </Button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: query.perPage ?? 9 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load blogs</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty */}
      {!loading && !error && (data?.length ?? 0) === 0 && (
        <p className="text-muted-foreground">No blogs found.</p>
      )}

      {/* Grid */}
      {!loading && !error && data && data.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}

      {/* Pagination (bottom) */}
      <Pager
        page={query.page ?? 1}
        pages={pages}
        onPrev={() => changePage(Math.max(1, (query.page ?? 1) - 1))}
        onNext={() => changePage(Math.min(pages, (query.page ?? 1) + 1))}
      />

      {/* Results meta (optional) */}
      {!loading && !error && total > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {(query.page! - 1) * (query.perPage!) + 1}
          {'–'}
          {Math.min(query.page! * (query.perPage!), total)} of {total} results
        </p>
      )}
    </div>
  );
}
