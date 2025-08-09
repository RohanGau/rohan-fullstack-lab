'use client';

import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { IBlogDto } from '@fullstack-lab/types';

function StatusBadge({ status }: { status?: IBlogDto['status'] }) {
  if (!status) return null;
  const variant =
    status === 'published' ? 'default' :
    status === 'draft' ? 'secondary' : 'outline';
  return <Badge variant={variant} className="uppercase">{status}</Badge>;
}

function FeaturedBadge({ isFeatured }: { isFeatured?: boolean }) {
  if (!isFeatured) return null;
  return <Badge>Featured</Badge>;
}

export function BlogMeta({ blog }: { blog: IBlogDto }) {
  const published = blog.publishedAt ? format(new Date(blog.publishedAt), 'PPP') : null;
  const created = blog.createdAt ? format(new Date(blog.createdAt), 'PPP') : null;
  const updated = blog.updatedAt ? format(new Date(blog.updatedAt), 'PPP') : null;

  return (
    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
      <div>
        By <span className="font-medium text-foreground">{blog.author}</span>
        {published ? <> · Published {published}</> : created ? <> · Created {created}</> : null}
        {updated ? <> · Updated {updated}</> : null}
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={blog.status} />
        <FeaturedBadge isFeatured={blog.isFeatured} />
        {blog.readingTime ? <span className="text-xs">⏱ {blog.readingTime} min read</span> : null}
      </div>
      {blog.slug ? (
        <div className="text-xs">
          Slug: <code className="rounded bg-muted px-1 py-0.5">{blog.slug}</code>
        </div>
      ) : null}
    </div>
  );
}
