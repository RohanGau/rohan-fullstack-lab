export function ResultsMeta({
  page, perPage, total, className,
}: { page: number; perPage: number; total: number; className?: string }) {
  if (!total) return null;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  return (
    <p className={`text-xs text-muted-foreground text-center ${className ?? ''}`}>
      Showing {start}–{end} of {total} results
    </p>
  );
}
