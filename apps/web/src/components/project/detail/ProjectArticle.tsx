import Image from 'next/image';
import type { IProjectDto } from '@fullstack-lab/types';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer';
import { BackToProjectsButton } from '@/components/project/BackToProjectsButton';

function ProjectArticle({ project }: { project: IProjectDto }) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <BackToProjectsButton />

      <h1 className="text-3xl font-bold leading-tight">{project.title}</h1>

      <p className="text-sm text-muted-foreground">
        {project.company ? <span className="capitalize">{project.company}</span> : null}
        {project.company && project.role ? ' • ' : null}
        {project.role ? <span className="capitalize">{project.role}</span> : null}
        {project.year ? (
          <>
            {' '}
            • <span>{project.year}</span>
          </>
        ) : null}
      </p>

      {project.types?.length ? (
        <div className="flex flex-wrap gap-2">
          {project.types.map((t) => (
            <Badge key={t} variant="secondary" className="capitalize">
              {t}
            </Badge>
          ))}
        </div>
      ) : null}

      {project.thumbnailUrl ? (
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl border bg-muted">
          <Image
            src={project.thumbnailUrl}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      ) : null}

      {project.description ? <MarkdownRenderer markdown={project.description} /> : null}

      {project.features?.length ? (
        <section>
          <h2 className="text-xl font-semibold mb-2">Key features</h2>
          <ul className="list-disc pl-6 space-y-1">
            {project.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {project.techStack?.length ? (
        <section>
          <h2 className="text-xl font-semibold mb-2">Tech stack</h2>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((t) => (
              <Badge key={t} variant="outline" className="capitalize">
                {t}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      {project.links?.length ? (
        <section>
          <h2 className="text-xl font-semibold mb-2">Links</h2>
          <ul className="space-y-1">
            {project.links.map((l, i) => (
              <li key={`${l.url}-${i}`}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {l.label || l.kind || l.url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

export default ProjectArticle;
