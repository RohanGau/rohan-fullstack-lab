import Link from 'next/link';
import type { IProjectDto } from '@fullstack-lab/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProjectCard } from '@/components/project/card/ProjectCard';

interface ProjectsPreviewProps {
  projects: IProjectDto[];
  error?: string | null;
}

export default function ProjectsPreview({ projects, error }: ProjectsPreviewProps) {
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

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Failed to load projects</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && projects.length === 0 && (
        <div className="text-center text-muted-foreground py-12">No featured projects found.</div>
      )}

      {!error && projects.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
