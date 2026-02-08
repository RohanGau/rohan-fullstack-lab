import { getSimpleIconByName } from '@/lib/simpleIcons';

export function SocialIcon({ name, url }: { name: string; url: string }) {
  const icon = getSimpleIconByName(name);
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
