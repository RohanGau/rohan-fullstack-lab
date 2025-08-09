'use client';

import { format } from 'date-fns';

export function AuthorAndDate({ author, date }: { author: string; date?: string | Date | null }) {
  return (
    <p className="text-sm text-muted-foreground">
      By <span className="font-medium text-foreground">{author}</span>
      {date ? <> · {format(new Date(date), 'PPP')}</> : null}
    </p>
  );
}
