'use client';

import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFeaturedProjects } from '@/hooks/useFeaturedProjects';
import { ProjectCard } from '@/components/project/card/ProjectCard';
import { BlogCardSkeleton } from '@/components/blog/card';

export default function ProjectsPreview() {
  const { featureProjects, loading, error } = useFeaturedProjects(3);

  return (
    <section aria-labelledby="featured-projects">
      <div className="flex items-center justify-between mb-6">
        <h2 id="featured-projects" className="text-2xl font-semibold">
          Featured Projects
        </h2>
        <Link href="/project" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>

      {/* Loading (same skeleton as blogs) */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1, 2].map((i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load projects</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty */}
      {!loading && !error && (!featureProjects || featureProjects.length === 0) && (
        <div className="text-center text-muted-foreground py-12">No featured projects found.</div>
      )}

      {/* List */}
      {!loading && !error && featureProjects && featureProjects.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featureProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
