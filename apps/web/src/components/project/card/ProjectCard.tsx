import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { IProjectDto } from '@fullstack-lab/types';
import { Cover } from './Cover';
import { FeaturedBadge, YearBadge } from './Badges';
import { CompanyRole } from './Meta';
import { TypeChips } from './Tags';
import { cn } from '@/lib/utils';

export function ProjectCard({ project, className }: { project: IProjectDto; className?: string }) {
  return (
    <Card className={cn('group hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden', className)}>
      <Cover src={project.thumbnailUrl} alt={project.title} />
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <FeaturedBadge isFeatured={project.isFeatured} />
          <YearBadge year={project.year} />
        </div>
        <CardTitle className="leading-snug line-clamp-2 text-lg">{project.title}</CardTitle>
        <CompanyRole company={project.company} role={project.role} />
      </CardHeader>
      <CardContent>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{project.description}</p>
        )}
        <TypeChips types={project.types} className="mb-2" />
        <Link
          href={`/project/${project.id}`}
          className="inline-block text-primary text-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
        >
          View Details →
        </Link>
      </CardContent>
    </Card>
  );
}
