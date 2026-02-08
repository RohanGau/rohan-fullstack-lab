import Link from 'next/link';
import { IProjectDto } from '@fullstack-lab/types';
import { ProjectCard } from './ProjectCard';

interface RelatedProjectsProps {
  projects: IProjectDto[];
}

/**
 * Related Projects Component
 *
 * SEO Benefits:
 * - Internal linking improves crawl depth
 * - Establishes topic clusters by technology
 * - Distributes page authority
 * - Reduces bounce rate
 * - Increases pageviews per session
 */
export function RelatedProjects({ projects }: RelatedProjectsProps) {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t pt-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Related Projects</h2>
        <p className="mt-2 text-muted-foreground">
          Explore more projects with similar technologies
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/project"
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          View all projects →
        </Link>
      </div>
    </section>
  );
}
