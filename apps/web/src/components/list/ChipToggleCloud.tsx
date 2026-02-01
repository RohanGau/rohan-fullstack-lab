import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function ChipToggleCloud({
  options,
  active,
  onToggle,
  onClear,
  prefix = '#',
  capitalize = false,
  initialLimit = 6,
}: {
  options: string[];
  active: string[];
  onToggle: (v: string) => void;
  onClear?: () => void;
  prefix?: string | null;
  capitalize?: boolean;
  initialLimit?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!options.length) return null;

  // Always show active chips + limited inactive chips when collapsed
  const activeSet = new Set(active);
  const activeChips = options.filter((t) => activeSet.has(t));
  const inactiveChips = options.filter((t) => !activeSet.has(t));

  const visibleChips = expanded
    ? options
    : [...activeChips, ...inactiveChips.slice(0, Math.max(0, initialLimit - activeChips.length))];

  const hiddenCount = options.length - visibleChips.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visibleChips.map((t) => {
        const isOn = activeSet.has(t);
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

      {hiddenCount > 0 && !expanded && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground"
          onClick={() => setExpanded(true)}
        >
          +{hiddenCount} more
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      )}

      {expanded && options.length > initialLimit && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground"
          onClick={() => setExpanded(false)}
        >
          Show less
          <ChevronUp className="ml-1 h-3 w-3" />
        </Button>
      )}

      {(active?.length ?? 0) > 0 && onClear && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  );
}
