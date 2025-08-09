'use client';

import { Badge } from '@/components/ui/badge';
import type { IBlogDto } from '@fullstack-lab/types';

export function StatusBadge({ status }: { status?: IBlogDto['status'] }) {
  if (!status) return null;
  const variant = status === 'published' ? 'default' : status === 'draft' ? 'secondary' : 'outline';
  return <Badge variant={variant} className="uppercase">{status}</Badge>;
}

export function FeaturedBadge({ isFeatured }: { isFeatured?: boolean }) {
  if (!isFeatured) return null;
  return <Badge>Featured</Badge>;
}

export function ReadingTime({ min }: { min?: number | null }) {
  if (!min) return null;
  return <span className="text-xs text-muted-foreground">{min} min read</span>;
}
