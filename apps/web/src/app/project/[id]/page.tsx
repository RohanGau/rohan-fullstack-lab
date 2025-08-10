'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { withClientFallback } from '@/lib/hoc/withClientFallback';
import { useProjectDetail } from '@/hooks/useProjectDetails';
import { BlogErrorMessage } from '@/components/blog/BlogErrorMessage';
import { BlogDetailSkeleton } from '@/components/blog/BlogDetailSkeleton';
import { isMongoId } from '@/lib/utils';

const ProjectArticle = withClientFallback(
  () => import('@/components/project/detail/ProjectArticle'),
  {
    fallback: <BlogDetailSkeleton />,
    errorFallback: <BlogErrorMessage message="Failed to load project details." />,
  }
);

export default function ProjectDetailPage() {
  const params = useParams();
  const raw =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : '';
  const id = useMemo(() => raw.trim(), [raw]);

  if (!id || !isMongoId(id)) {
    return <BlogErrorMessage message="Invalid project id" />;
  }

  const { project, loading, error } = useProjectDetail(id);

  if (loading) return <BlogDetailSkeleton />;
  if (error || !project) return <BlogErrorMessage message={error || 'Project not found'} />;

  return <ProjectArticle project={project} />;
}
