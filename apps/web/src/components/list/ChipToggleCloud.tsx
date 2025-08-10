import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ChipToggleCloud({
  options,
  active,
  onToggle,
  onClear,
  prefix = '#',
  capitalize = false,
}: {
  options: string[];
  active: string[];
  onToggle: (v: string) => void;
  onClear?: () => void;
  prefix?: string | null;
  capitalize?: boolean;
}) {
  if (!options.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((t) => {
        const isOn = active.includes(t);
        return (
          <Badge
            key={t}
            variant={isOn ? 'default' : 'secondary'}
            className={`cursor-pointer select-none ${capitalize ? 'capitalize' : ''}`}
            onClick={() => onToggle(t)}
          >
            {prefix ? `${prefix}${t}` : t}
          </Badge>
        );
      })}
      {(active?.length ?? 0) > 0 && onClear && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  );
}
