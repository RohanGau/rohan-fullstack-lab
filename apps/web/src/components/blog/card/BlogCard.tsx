'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { IBlogDto } from '@fullstack-lab/types';
import { Cover } from './Cover';
import { FeaturedBadge, StatusBadge, ReadingTime } from './Badges';
import { AuthorAndDate } from './Meta';
import { TagChips } from './Tags';
import { trackEvent } from '@/components/monitoring/GoogleAnalytics';

export type BlogCardVariant = 'default' | 'compact';

export function BlogCard({
  blog,
  className,
  variant = 'default',
  priorityImage = false,
  showStatus = false,
  showTags = true,
  onCardClick,
}: {
  blog: IBlogDto;
  className?: string;
  variant?: BlogCardVariant;
  priorityImage?: boolean;
  showStatus?: boolean;
  showTags?: boolean;
  onCardClick?: () => void;
}) {
  const href = `/blog/${blog.slug || blog.id}`;
  const date = blog.publishedAt ?? blog.createdAt;
  const showSummary = variant === 'default' && !!blog.summary;
  const tagMax = variant === 'default' ? 5 : 3;

  const handleClick = () => {
    // Track blog card clicks for content performance insights
    trackEvent('blog_card_click', {
      event_category: 'engagement',
      event_label: blog.title,
      blog_id: blog.id,
      has_cover: !!blog.coverImageUrl,
      is_featured: blog.isFeatured,
    });

    // Call additional handler if provided (e.g., from RelatedPosts)
    if (onCardClick) {
      onCardClick();
    }
  };

  return (
    <Card
      className={cn(
        'group hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden',
        className
      )}
    >
      {/* Cover with overlay + top-left badges */}
      <div className="relative">
        <Cover src={blog.coverImageUrl} alt={blog.title} priority={priorityImage} withOverlay />
        <div className="absolute left-3 top-3 flex gap-2">
          {showStatus && <StatusBadge status={blog.status} />}
          <FeaturedBadge isFeatured={blog.isFeatured} />
        </div>
      </div>

      <CardHeader className={cn('space-y-2', variant === 'compact' && 'pb-2')}>
        <div className="flex items-center gap-2">
          <ReadingTime min={blog.readingTime} />
        </div>

        <CardTitle
          className={cn(
            'leading-snug',
            variant === 'default' ? 'line-clamp-2 text-lg' : 'line-clamp-1 text-base'
          )}
        >
          {blog.title}
        </CardTitle>

        <AuthorAndDate author={blog.author} date={date} />
      </CardHeader>

      <CardContent className={cn(variant === 'compact' && 'pt-0')}>
        {showSummary && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{blog.summary}</p>
        )}

        {showTags && (
          <TagChips
            tags={blog.tags}
            max={tagMax}
            className={variant === 'compact' ? 'mb-1' : 'mb-2'}
          />
        )}

        <Link
          href={href}
          aria-label={`Read: ${blog.title}`}
          className="inline-block text-primary text-sm underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
          onClick={handleClick}
        >
          Read More →
        </Link>
      </CardContent>
    </Card>
  );
}
