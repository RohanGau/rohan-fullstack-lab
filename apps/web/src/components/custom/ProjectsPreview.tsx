'use client';

import Link from 'next/link';
import { ProjectCard } from '../project/ProjectCard';
// import { useFeaturedProjects } from '@/hooks/useFeaturedProjects';
import { useFeaturedProjects } from '@/hooks/useFeaturedProjects';
import { BlogListSkeleton } from '../blog/BlogListSkeleton';

export default function ProjectsPreview() {
  const { featureProjects, loading, error } = useFeaturedProjects(3);

  if (loading) return <BlogListSkeleton numberOfSkeletons={4} />;

  if (error) {
    return (
      <div className="text-center text-red-500 py-12">
        <p>Failed to load projects. Please try again later.</p>
        <p className="mt-2 text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Featured Projects</h2>
        <Link href="/projects" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {featureProjects && featureProjects.length > 0 ? (
          featureProjects.map(p => <ProjectCard key={p.id} project={p} />)
        ) : (
          <div className="text-center text-muted-foreground py-12 col-span-2">
            No featured projects found.
          </div>
        )}
      </div>
    </section>
  );
}