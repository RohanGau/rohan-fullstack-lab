'use client';

import { useParams, useRouter } from 'next/navigation';
import { useBlogDetail } from '@/hooks/useBlogDetail';
import { format } from 'date-fns';
// import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogDetailSkeleton } from '@/components/blog/BlogDetailSkeleton';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer';
// import remarkGfm from 'remark-gfm';
// import rehypeHighlight from 'rehype-highlight';
// import "./markdown.css";


export default function BlogDetailPage() {
  const { id } = useParams();
  const { blog, loading, error } = useBlogDetail(id);
  const router = useRouter();

  if (loading) return <BlogDetailSkeleton />;
  if (error || !blog) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error || 'Blog not found'}</p>
        <Button variant="outline" onClick={() => router.push('/blog')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Button>
      </div>
    );
  }

  if (!blog) return <p className="text-center">Blog not found</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2 mb-4 text-muted-foreground"
        onClick={() => router.push('/blog')}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blogs
      </Button>

      {/* Title */}
      <h1 className="text-3xl font-bold leading-tight">{blog.title}</h1>

      {/* Meta */}
      <p className="text-sm text-muted-foreground">
        By <span className="font-medium">{blog.author}</span> ·{' '}
        {format(new Date(blog.createdAt), 'PPP')}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {blog.tags?.map((tag) => (
          <Badge key={tag} variant="secondary">
            #{tag}
          </Badge>
        ))}
      </div>
      <MarkdownRenderer markdown={blog.content} />
        {/* <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
        >
            {blog.content}
        </ReactMarkdown> */}
    </div>
  );
}
