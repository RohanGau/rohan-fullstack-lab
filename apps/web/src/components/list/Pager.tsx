import { Button } from '@/components/ui/button';

export function Pager({
  page,
  pages,
  onPrev,
  onNext,
  className,
}: {
  page: number;
  pages: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}) {
  if (pages <= 1) return null;
  return (
    <div className={`flex items-center justify-center gap-2 pt-6 ${className ?? ''}`}>
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={onPrev}
        aria-label="Previous page"
      >
        Prev
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {pages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= pages}
        onClick={onNext}
        aria-label="Next page"
      >
        Next
      </Button>
    </div>
  );
}
