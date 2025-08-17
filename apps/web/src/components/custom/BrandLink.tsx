import { cn } from '@/lib/utils';

type BrandLinkProps = {
  href?: string;
  icon: { path: string; hex: string };
  label: string;
  light?: `#${string}`;
  dark?: `#${string}`;
  className?: string;
};

function BrandLink({ href, icon, label, light, dark, className }: BrandLinkProps) {
  const lightHex = (light ?? `#${icon.hex}`) as `#${string}`;
  const darkHex = (dark ?? lightHex) as `#${string}`;
  const style = {
    ['--brand' as any]: lightHex,
    ['--brand-dark' as any]: darkHex,
  } as React.CSSProperties;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      style={style}
      className={cn(
        'text-muted-foreground transition-colors hover:text-[var(--brand)] dark:hover:text-[var(--brand-dark)]',
        className
      )}
    >
      <svg role="img" viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <title>{label}</title>
        <path d={icon.path} fill="currentColor" />
      </svg>
    </a>
  );
}

export default BrandLink;
