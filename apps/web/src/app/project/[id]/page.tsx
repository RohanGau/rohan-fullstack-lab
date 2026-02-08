import { notFound } from 'next/navigation';
import ProjectArticle from '@/components/project/detail/ProjectArticle';
import { getProjectById } from '@/lib/server/projectApi';
import { isMongoId } from '@/lib/utils';

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

  return <ProjectArticle project={project} />;
}
