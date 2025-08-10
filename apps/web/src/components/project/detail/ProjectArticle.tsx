
import type { IProjectDto } from '@fullstack-lab/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer';

function ProjectArticle({ project }: { project: IProjectDto }) {
  const router = useRouter();
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <Button variant="outline" onClick={() => (history.length > 1 ? router.back() : router.push('/projects'))}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <h1 className="text-3xl font-bold leading-tight">{project.title}</h1>

      <p className="text-sm text-muted-foreground">
        {project.company ? <span className="capitalize">{project.company}</span> : null}
        {project.company && project.role ? ' • ' : null}
        {project.role ? <span className="capitalize">{project.role}</span> : null}
        {project.year ? <> • <span>{project.year}</span></> : null}
      </p>

      {project.types?.length ? (
        <div className="flex flex-wrap gap-2">
          {project.types.map((t) => (
            <Badge key={t} variant="secondary" className="capitalize">{t}</Badge>
          ))}
        </div>
      ) : null}

      {project.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.thumbnailUrl} alt={project.title} className="rounded-xl w-full" />
      ) : null}

      {project.description ? <MarkdownRenderer markdown={project.description} />  : null}

      {project.features?.length ? (
        <section>
          <h2 className="text-xl font-semibold mb-2">Key features</h2>
          <ul className="list-disc pl-6 space-y-1">
            {project.features.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </section>
      ) : null}

      {project.techStack?.length ? (
        <section>
          <h2 className="text-xl font-semibold mb-2">Tech stack</h2>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((t) => (
              <Badge key={t} variant="outline" className="capitalize">{t}</Badge>
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
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">
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