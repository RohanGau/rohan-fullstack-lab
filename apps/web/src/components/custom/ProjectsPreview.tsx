import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { useFeaturedProjects } from '@/hooks/useFeaturedProjects';
import { BlogListSkeleton } from '../blog/BlogListSkeleton';

function ProjectsPreview() {
  const {
    featureProjects,
    loading,
    error
  } = useFeaturedProjects();

  if (loading) return <BlogListSkeleton numberOfSkeletons={3} />;
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
        {featureProjects?.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 space-y-3">
              {project.thumbnailUrl && (
                <Image
                  src={project.thumbnailUrl}
                  alt={project.title}
                  width={600}
                  height={400}
                  className="w-full h-auto rounded"
                />
              )}
              <h3 className="text-lg font-semibold">{project.title}</h3>
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
              {project.techStack?.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  <strong>Stack:</strong> {project.techStack.join(', ')}
                </p>
              )}
              {project.link && (
                <Link
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View Project ↗
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default ProjectsPreview;
