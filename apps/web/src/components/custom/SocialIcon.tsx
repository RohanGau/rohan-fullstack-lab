import { getSimpleIconSlug } from '@/lib/utils';
import * as simpleIcons from 'simple-icons';

export function SocialIcon({ name, url }: { name: string; url: string }) {
  const slug = getSimpleIconSlug(name);
  const iconKey = 'si' + slug.charAt(0).toUpperCase() + slug.slice(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icon = (simpleIcons as any)[iconKey];
  const svg = icon?.svg?.replace(/fill="[^"]*"/g, `fill="#${icon.hex}"`);

  if (!svg) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label={name}
      className="text-muted-foreground hover:text-foreground w-5 h-5"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
