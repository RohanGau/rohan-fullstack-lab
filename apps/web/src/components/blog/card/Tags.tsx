'use client';

import { cn } from '@/lib/utils';

export function TagChips({
  tags,
  max = 5,
  className,
}: {
  tags?: string[] | null;
  max?: number;
  className?: string;
}) {
  if (!tags?.length) return null;
  const show = tags.slice(0, max);
  const extra = Math.max(0, tags.length - max);
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {show.map((t) => (
        <span key={t} className="text-xs bg-muted px-2 py-1 rounded">
          {t}
        </span>
      ))}
      {extra > 0 && <span className="text-xs text-muted-foreground">+{extra}</span>}
    </div>
  );
}
