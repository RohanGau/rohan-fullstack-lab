import type { BlogLink } from '@fullstack-lab/types';

const kindLabel: Record<NonNullable<BlogLink['kind']>, string> = {
  repo: 'Repository',
  ref: 'Reference',
  demo: 'Demo',
  other: 'Link',
};

export function BlogLinks({ links }: { links: BlogLink[] }) {
  if (!links?.length) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Links</h3>
      <ul className="list-disc list-inside space-y-1">
        {links.map((l, idx) => (
          <li key={`${l.url}-${idx}`}>
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              {l.label || l.url}
            </a>
            {l.kind ? (
              <span className="ml-2 text-xs text-muted-foreground">
                ({kindLabel[l.kind] || l.kind})
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
