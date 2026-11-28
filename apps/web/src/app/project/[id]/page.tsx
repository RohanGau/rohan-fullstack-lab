import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProjectArticle from '@/components/project/detail/ProjectArticle';
import { getProjectByIdCached, getRelatedProjectsCached } from '@/lib/server/projectApi';
import { isMongoId, stripMarkdown } from '@fullstack-lab/constants';
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

export async function generateMetadata(props: ProjectDetailPageProps): Promise<Metadata> {
  const { id } = await props.params;
  const raw = Array.isArray(id) ? id[0] : (id ?? '');
  const projectId = raw.trim();

  if (!projectId || !isMongoId(projectId)) {
    return {
      title: 'Project not found',
      robots: { index: false, follow: false },
    };
  }

  const project = await getProjectByIdCached(projectId);
  if (!project) {
    return {
      title: 'Project not found',
      robots: { index: false, follow: false },
    };
  }

  const urlPath = `/project/${project.id}`;
  const description = stripMarkdown(project.description || '').slice(0, 160);
  const images = project.thumbnailUrl ? [{ url: project.thumbnailUrl }] : undefined;

  return {
    title: project.title,
    description,
    alternates: { canonical: urlPath },
    robots: { index: true, follow: true },
    keywords: [...(project.types ?? []), ...(project.techStack ?? [])],
    openGraph: {
      type: 'website',
      url: urlPath,
      title: `${project.title} · Rohan Kumar`,
      description,
      images,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} · Rohan Kumar`,
      description,
      images,
    },
  };
}

export default async function ProjectDetailPage(props: ProjectDetailPageProps) {
  const { id } = await props.params;
  const raw = Array.isArray(id) ? id[0] : (id ?? '');
  const projectId = raw.trim();

  if (!projectId || !isMongoId(projectId)) {
    notFound();
  }

  const project = await getProjectByIdCached(projectId);
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
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: project.title,
            description: stripMarkdown(project.description || '').slice(0, 160),
            url: `${siteUrl}/project/${project.id}`,
            image: project.thumbnailUrl ? [project.thumbnailUrl] : undefined,
            keywords:
              [...(project.types ?? []), ...(project.techStack ?? [])].join(', ') || undefined,
            author: { '@type': 'Person', name: 'Rohan Kumar', url: siteUrl },
            dateCreated: project.createdAt,
            dateModified: project.updatedAt || project.createdAt,
          }),
        }}
      />
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
