'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { BlogDetailSkeleton } from '@/components/blog/BlogDetailSkeleton';
import { BlogErrorMessage } from '@/components/blog/BlogErrorMessage';
import { BlogArticle } from '@/components/blog/detail';
import { useBlogDetailParam } from '@/hooks/useBlogDetail';

export default function BlogDetailPage() {
  const params = useParams();
  const raw =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : '';

  const param = useMemo(() => raw.trim(), [raw]);
  if (!param) return <BlogErrorMessage message="Invalid blog identifier" />;

  const { blog, loading, error } = useBlogDetailParam(param);

  if (loading) return <BlogDetailSkeleton />;
  if (error || !blog) return <BlogErrorMessage message={error || 'Blog not found'} />;

  return <BlogArticle blog={blog} />;
}
