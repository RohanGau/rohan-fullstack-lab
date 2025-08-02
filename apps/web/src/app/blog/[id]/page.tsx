'use client';

import { useParams } from 'next/navigation';
import { useBlogDetail } from '@/hooks/useBlogDetail';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { BlogDetailSkeleton } from '@/components/blog/BlogDetailSkeleton';
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer';
import { BlogErrorMessage } from '@/components/blog/BlogErrorMessage';
import { BackToBlogButton } from '@/components/blog/BackToBlogButton';

export default function BlogDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : undefined;

  const { blog, loading, error } = useBlogDetail(id ?? '');

  if (!id) return <BlogErrorMessage message="Invalid blog ID" />;
  if (loading) return <BlogDetailSkeleton />;
  if (error || !blog) return <BlogErrorMessage message={error || 'Blog not found'} />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Back Button */}
      <BackToBlogButton className="mb-4 text-muted-foreground" />

      {/* Title */}
      <h1 className="text-3xl font-bold leading-tight">{blog.title}</h1>

      {/* Meta */}
      <p className="text-sm text-muted-foreground">
        By <span className="font-medium">{blog.author}</span> · {format(new Date(blog.createdAt), 'PPP')}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {blog.tags?.map((tag) => (
          <Badge key={tag} variant="secondary">
            #{tag}
          </Badge>
        ))}
      </div>

      {/* Content */}
      <MarkdownRenderer markdown={blog.content} />
    </div>
  );
}
