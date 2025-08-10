'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/project/card/ProjectCard';
import { useDebounced, SearchBox } from '@/components/list/SearchBox';
import { SortSelect, FeaturedSelect, PerPageSelect } from '@/components/list/Selects';
import { ChipToggleCloud } from '@/components/list/ChipToggleCloud';
import { Pager } from '@/components/list/Pager';
import { ResultsMeta } from '@/components/list/ResultsMeta';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BlogCardSkeleton } from '@/components/blog/card';

const arrToCsv = (a?: string[]) => (a && a.length ? a.join(',') : '');
const csvToArr = (s?: string | null) =>
  s
    ? s
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

export default function ProjectListPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const initial = useMemo(() => {
    const page = Number(sp.get('page') ?? 1);
    const perPage = Number(sp.get('perPage') ?? 9);
    const q = sp.get('q') ?? '';
    const types = csvToArr(sp.get('types'));
    const featured = sp.get('featured');
    const isFeatured = featured === 'true' ? true : featured === 'false' ? false : undefined;
    const sortField =
      (sp.get('sortField') as 'createdAt' | 'updatedAt' | 'year' | 'title' | null) ?? 'createdAt';
    const sortOrder = (sp.get('sortOrder') as 'ASC' | 'DESC' | null) ?? 'DESC';
    return { page, perPage, search: q, types, isFeatured, sort: [sortField, sortOrder] as any };
  }, [sp]);

  const { data, total, pages, loading, error, query, setQuery } = useProjects(initial);
  const [search, setSearch] = useState(query.search ?? '');
  const debouncedSearch = useDebounced(search);

  // derive type options from page data
  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((p) => (p.types ?? []).forEach((t) => set.add(t)));
    (query.types ?? []).forEach((t) => set.add(t));
    return Array.from(set).sort();
  }, [data, query.types]);

  // sync → URL
  useEffect(() => {
    const s = new URLSearchParams();
    s.set('page', String(query.page ?? 1));
    s.set('perPage', String(query.perPage ?? 9));
    if (query.search) s.set('q', query.search);
    if (query.types?.length) s.set('types', arrToCsv(query.types));
    if (typeof query.isFeatured === 'boolean') s.set('featured', String(query.isFeatured));
    const [sf, so] = query.sort ?? ['createdAt', 'DESC'];
    s.set('sortField', sf);
    s.set('sortOrder', so);
    router.replace(`/project?${s.toString()}`);
  }, [router, query]);

  // debounce → query
  useEffect(() => {
    setQuery((q) => ({ ...q, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch, setQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Projects</h1>
        <p className="text-muted-foreground text-sm">Selected work, tools, and experiments.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchBox value={search} onChange={setSearch} placeholder="Search projects…" />
        <div className="flex gap-2">
          <SortSelect
            value={`${query.sort?.[0] ?? 'createdAt'}:${query.sort?.[1] ?? 'DESC'}`}
            onChange={(v) => {
              const [f, o] = v.split(':') as any;
              setQuery((q) => ({ ...q, sort: [f, o], page: 1 }));
            }}
            options={[
              { label: 'Newest', value: 'createdAt:DESC' },
              { label: 'Oldest', value: 'createdAt:ASC' },
              { label: 'Year ↓', value: 'year:DESC' },
              { label: 'Year ↑', value: 'year:ASC' },
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

      {typeOptions.length > 0 && (
        <ChipToggleCloud
          options={typeOptions}
          active={query.types ?? []}
          onToggle={(t) => {
            setQuery((q) => {
              const s = new Set(q.types ?? []);
              s.has(t) ? s.delete(t) : s.add(t);
              return { ...q, types: Array.from(s), page: 1 };
            });
          }}
          onClear={() => setQuery((q) => ({ ...q, types: [], page: 1 }))}
          prefix={null}
          capitalize
        />
      )}

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: query.perPage ?? 9 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load projects</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && data.length === 0 && (
        <p className="text-muted-foreground">No projects found.</p>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

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
