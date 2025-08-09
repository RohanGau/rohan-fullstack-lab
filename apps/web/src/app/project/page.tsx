'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProjectCard } from '@/components/project/ProjectCard';
import { BlogListSkeleton } from '@/components/blog/BlogListSkeleton';

const ALL_TYPES = ['web','mobile','api','cli','tool','library','backend','frontend','desktop'];

export default function ProjectsListClient() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const perPage = 8;

  const { data, pages, loading, error } = useProjects({
    page,
    perPage,
    search,
    types,
    sort: ['createdAt', 'DESC'],
  });

  const toggleType = (t: string) => {
    setPage(1);
    setTypes((prev) => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));
  };

  const applySearch = () => {
    setPage(1);
    setSearch(pending);
  };

  return (
    <section className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <Input
            placeholder="Search projects…"
            value={pending}
            onChange={(e) => setPending(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
          />
          <Button onClick={applySearch}>Search</Button>
          {search && (
            <Button variant="ghost" onClick={() => { setPending(''); setSearch(''); setPage(1); }}>
              Clear
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_TYPES.map(t => (
            <Badge
              key={t}
              variant={types.includes(t) ? 'default' : 'secondary'}
              className="cursor-pointer select-none"
              onClick={() => toggleType(t)}
            >
              {t}
            </Badge>
          ))}
          {types.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setTypes([]); setPage(1); }}
            >
              Reset types
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Grid */}
      {loading ? (
        <BlogListSkeleton numberOfSkeletons={perPage / 2} />
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">No projects found.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {data.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          disabled={page <= 1 || loading}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          ← Prev
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {pages}
        </span>
        <Button
          variant="outline"
          disabled={page >= pages || loading}
          onClick={() => setPage(p => p + 1)}
        >
          Next →
        </Button>
      </div>
    </section>
  );
}
