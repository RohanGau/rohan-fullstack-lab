'use client';

export const runtime = 'edge';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { BlogDetailSkeleton } from '@/components/blog/BlogDetailSkeleton';
import { BlogErrorMessage } from '@/components/blog/BlogErrorMessage';
import { useBlogDetailParam } from '@/hooks/useBlogDetail';
import { withClientFallback } from '@/lib/hoc/withClientFallback';

const BlogArticle = withClientFallback(() => import('@/components/blog/detail'), {
  fallback: <BlogDetailSkeleton />,
  errorFallback: <BlogErrorMessage message="Failed to load project details." />,
});

export default function BlogDetailPage() {
  const params = useParams();
  const raw =
    typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const param = useMemo(() => raw.trim(), [raw]);

  const { blog, loading, error } = useBlogDetailParam(param);

  if (!param) return <BlogErrorMessage message="Invalid blog identifier" />;
  if (loading) return <BlogDetailSkeleton />;
  if (error || !blog) return <BlogErrorMessage message={error || 'Blog not found'} />;

  return <BlogArticle blog={blog} />;
}
