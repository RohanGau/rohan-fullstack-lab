export function TypeChips({
  types = [],
  max = 5,
  className = '',
}: {
  types?: string[];
  max?: number;
  className?: string;
}) {
  if (!types.length) return null;
  const shown = types.slice(0, max);
  const more = types.length - shown.length;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {shown.map((t) => (
        <span key={t} className="text-xs bg-muted px-2 py-1 rounded capitalize">
          {t}
        </span>
      ))}
      {more > 0 && <span className="text-xs text-muted-foreground">+{more}</span>}
    </div>
  );
}
