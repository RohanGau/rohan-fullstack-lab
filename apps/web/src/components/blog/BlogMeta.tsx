import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { IBlogDto } from '@fullstack-lab/types';

function StatusBadge({ status }: { status?: IBlogDto['status'] }) {
  if (!status) return null;
  const variant = status === 'published' ? 'default' : status === 'draft' ? 'secondary' : 'outline';
  return (
    <Badge variant={variant} className="uppercase">
      {status}
    </Badge>
  );
}

function FeaturedBadge({ isFeatured }: { isFeatured?: boolean }) {
  if (!isFeatured) return null;
  return <Badge>Featured</Badge>;
}

export function BlogMeta({ blog }: { blog: IBlogDto }) {
  const published = blog.publishedAt ? format(new Date(blog.publishedAt), 'PPP') : null;
  const created = blog.createdAt ? format(new Date(blog.createdAt), 'PPP') : null;
  const updated = blog.updatedAt ? format(new Date(blog.updatedAt), 'PPP') : null;

  // SEO: Show if content was significantly updated (more than 7 days after publish)
  const publishedDate = blog.publishedAt ? new Date(blog.publishedAt) : null;
  const updatedDate = blog.updatedAt ? new Date(blog.updatedAt) : null;
  const daysSinceUpdate =
    publishedDate && updatedDate
      ? Math.floor((updatedDate.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
  const isSignificantlyUpdated = daysSinceUpdate > 7;

  return (
    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
      <div>
        By <span className="font-medium text-foreground">{blog.author}</span>
        {published ? <> · Published {published}</> : created ? <> · Created {created}</> : null}
      </div>
      {/* SEO: Prominent "Last Updated" indicator for content freshness signal */}
      {isSignificantlyUpdated && updated && (
        <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
            <path d="M12 6v6l4 2" />
          </svg>
          Last updated {updated}
        </div>
      )}
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
