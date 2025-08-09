'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useProjectDetail } from '@/hooks/useProjectDetails';
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer';
import { ProjectDetailSkeleton } from '@/components/project/ProjectDetailSkeleton';
import { ProjectErrorMessage } from '@/components/project/ProjectErrorMessage';
import { BackToProjectsButton } from '@/components/project/BackToProjectsButton';

export default function ProjectDetailPage() {
  const params = useParams();
  const id =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : undefined;

  if (!id) return <ProjectErrorMessage message="Invalid project ID" />;

  const { project, loading, error } = useProjectDetail(id);

  if (loading) return <ProjectDetailSkeleton />;
  if (error || !project) return <ProjectErrorMessage message={error || 'Project not found'} />;

  const live = (project.links || []).find(l => l.kind === 'live');
  const repo = (project.links || []).find(l => l.kind === 'repo');
  const other = (project.links || []).filter(l => l !== live && l !== repo);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Back */}
      <BackToProjectsButton className="mb-4 text-muted-foreground" />

      {/* Title */}
      <h1 className="text-3xl font-bold leading-tight">{project.title}</h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {project.company && <span><span className="font-medium">Company:</span> {project.company}</span>}
        {project.company && project.role && <span>·</span>}
        {project.role && <span><span className="font-medium">Role:</span> {project.role}</span>}
        {project.year && (
          <>
            {(project.company || project.role) && <span>·</span>}
            <span><span className="font-medium">Year:</span> {project.year}</span>
          </>
        )}
      </div>

      {/* Types */}
      {(project.types?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.types!.map(t => (
            <Badge key={t} variant="secondary" className="text-[11px]">{t}</Badge>
          ))}
        </div>
      )}

      {/* Thumbnail */}
      {project.thumbnailUrl && (
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={project.thumbnailUrl}
            alt={project.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Description (Markdown) */}
      <Card>
        <CardContent className="p-6">
          <MarkdownRenderer markdown={project.description || ''} />
        </CardContent>
      </Card>

      {/* Tech & Links */}
      <div className="grid md:grid-cols-2 gap-6">
        {(project.techStack?.length || 0) > 0 && (
          <Card>
            <CardContent className="p-6 space-y-2">
              <h3 className="text-lg font-semibold">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack!.map(t => (
                  <Badge key={t} variant="outline" className="text-[11px]">{t}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {(project.links?.length || 0) > 0 && (
          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="text-lg font-semibold">Links</h3>
              <div className="flex flex-wrap gap-3">
                {live?.url && (
                  <Button asChild size="sm" variant="secondary">
                    <Link href={live.url} target="_blank" rel="noopener noreferrer">
                      {live.label || 'Live'} ↗
                    </Link>
                  </Button>
                )}
                {repo?.url && (
                  <Button asChild size="sm" variant="secondary">
                    <Link href={repo.url} target="_blank" rel="noopener noreferrer">
                      {repo.label || 'Repository'} ↗
                    </Link>
                  </Button>
                )}
                {other.map((l, i) => (
                  <Button asChild key={`${l.url}-${i}`} size="sm" variant="ghost">
                    <Link href={l.url!} target="_blank" rel="noopener noreferrer">
                      {l.label || l.kind || 'Link'} ↗
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
