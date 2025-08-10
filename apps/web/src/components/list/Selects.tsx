import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type SortOption<F extends string> = { label: string; value: `${F}:${'ASC'|'DESC'}` };

export function SortSelect<F extends string>({
  value,
  options,
  onChange,
  widthClass = 'w-[180px]',
}: {
  value: string;
  options: SortOption<F>[];
  onChange: (v: string) => void;
  widthClass?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={widthClass}>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FeaturedSelect({
  value, // 'all' | 'featured' | 'non'
  onChange,
  widthClass = 'w-[150px]',
}: {
  value: 'all' | 'featured' | 'non';
  onChange: (v: 'all' | 'featured' | 'non') => void;
  widthClass?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as any)}>
      <SelectTrigger className={widthClass}>
        <SelectValue placeholder="Featured" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="featured">Featured</SelectItem>
        <SelectItem value="non">Non-featured</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function PerPageSelect({
  value,
  onChange,
  options = [6, 9, 12, 18],
  widthClass = 'w-[120px]',
}: {
  value: number;
  onChange: (v: number) => void;
  options?: number[];
  widthClass?: string;
}) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger className={widthClass}>
        <SelectValue placeholder="Per page" />
      </SelectTrigger>
      <SelectContent>
        {options.map((n) => (
          <SelectItem key={n} value={String(n)}>
            {n}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
