'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IProjectDto } from '@fullstack-lab/types';
import { stripMarkdown, pickPrimaryLink, truncate } from '@/lib/utils';
import { trackEvent } from '@/components/monitoring/GoogleAnalytics';

export function ProjectCard({
  project,
  onCardClick,
}: {
  project: IProjectDto;
  onCardClick?: () => void;
}) {
  const primary = pickPrimaryLink(project);
  const desc = truncate(stripMarkdown(project.description || ''), 220);

  const types = project.types?.slice(0, 3) || [];
  const typesRest = (project.types?.length || 0) - types.length;

  const tech = project.techStack?.slice(0, 4) || [];
  const techRest = (project.techStack?.length || 0) - tech.length;

  const handleReadMoreClick = () => {
    // Track project card clicks for content performance insights
    trackEvent('project_card_click', {
      event_category: 'engagement',
      event_label: project.title,
      project_id: project.id,
      has_thumbnail: !!project.thumbnailUrl,
      is_featured: project.isFeatured,
    });

    // Call additional handler if provided (e.g., from RelatedProjects)
    if (onCardClick) {
      onCardClick();
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {project.thumbnailUrl && (
          <div className="relative w-full aspect-[3/2] overflow-hidden rounded-lg">
            <Image
              src={project.thumbnailUrl}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <Badge key={t} variant="secondary" className="text-[11px]">
              {t}
            </Badge>
          ))}
          {typesRest > 0 && (
            <Badge variant="secondary" className="text-[11px]">
              +{typesRest} more
            </Badge>
          )}
        </div>

        <h3 className="text-lg font-semibold">{project.title}</h3>

        {desc && <p className="text-sm text-muted-foreground">{desc}</p>}

        {tech.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Stack:</span> {tech.join(', ')}
            {techRest > 0 ? `, +${techRest} more` : ''}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <Button asChild variant="link" className="px-0 h-auto text-xs">
            <Link href={`/project/${project.id}`} onClick={handleReadMoreClick}>
              Read more →
            </Link>
          </Button>

          {primary?.url && (
            <Button asChild variant="link" className="px-0 h-auto text-xs">
              <Link
                href={primary.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  // Track external project link clicks
                  trackEvent('project_external_link_click', {
                    event_category: 'outbound',
                    event_label: project.title,
                    link_type: primary.kind,
                    destination: primary.url,
                  });
                }}
              >
                {primary.label?.trim() || (primary.kind === 'repo' ? 'Repository' : 'Live')} ↗
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
