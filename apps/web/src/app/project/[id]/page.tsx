import { notFound } from 'next/navigation';
import ProjectArticle from '@/components/project/detail/ProjectArticle';
import { getProjectById, getRelatedProjectsCached } from '@/lib/server/projectApi';
import { isMongoId } from '@/lib/utils';
import { siteUrl } from '@/lib/constant';
import { RelatedProjects } from '@/components/project/RelatedProjects';

type RouteParams = {
  id: string | string[];
};

type ProjectDetailPageProps = {
  params: Promise<RouteParams>;
};

export const runtime = 'edge';
export const revalidate = 60;

export default async function ProjectDetailPage(props: ProjectDetailPageProps) {
  const { id } = await props.params;
  const raw = Array.isArray(id) ? id[0] : (id ?? '');
  const projectId = raw.trim();

  if (!projectId || !isMongoId(projectId)) {
    notFound();
  }

  const project = await getProjectById(projectId);
  if (!project) {
    notFound();
  }

  // SEO: Fetch related projects for internal linking
  const relatedProjects = await getRelatedProjectsCached(project.id, project.types, 3);

  return (
    <>
      <ProjectArticle project={project} />
      {/* SEO: Related projects for internal linking and topic clustering */}
      <RelatedProjects projects={relatedProjects} currentProjectTitle={project.title} />
      {/* SEO: BreadcrumbList structured data for better navigation understanding */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Projects', item: `${siteUrl}/project` },
              {
                '@type': 'ListItem',
                position: 2,
                name: project.title,
                item: `${siteUrl}/project/${project.id}`,
              },
            ],
          }),
        }}
      />
    </>
  );
}
