'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Cover({
  src,
  alt,
  withOverlay = true,
  priority,
  className,
}: {
  src?: string | null;
  alt: string;
  withOverlay?: boolean;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('relative w-full aspect-[16/9] overflow-hidden rounded-t-xl', className)}>
      {src ? (
        <>
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={priority}
          />
          {withOverlay && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
          )}
        </>
      ) : (
        <div className="h-full w-full bg-muted" />
      )}
    </div>
  );
}
