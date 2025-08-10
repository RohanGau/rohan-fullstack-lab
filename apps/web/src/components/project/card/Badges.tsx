import { Badge } from '@/components/ui/badge';

export function FeaturedBadge({ isFeatured }: { isFeatured?: boolean }) {
  if (!isFeatured) return null;
  return <Badge>Featured</Badge>;
}

export function YearBadge({ year }: { year?: number }) {
  if (!year) return null;
  return <Badge variant="secondary">{year}</Badge>;
}
