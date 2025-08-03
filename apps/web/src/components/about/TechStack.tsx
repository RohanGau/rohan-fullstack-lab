import { Badge } from '@/components/ui/badge';

export function TechStack({ stack }: { stack: string[] | undefined }) {
  return (
    <details className="mt-8 mb-6">
        <summary className="cursor-pointer text-sm mb-2 text-muted-foreground">
        ▾ View my full stack & dev tools
        </summary>
        <div className="flex flex-wrap gap-2 mt-2">
        {(stack || []).map((tool) => (
            <Badge key={tool} variant="outline">
            {tool}
            </Badge>
        ))}
        </div>
    </details>
  );
}
