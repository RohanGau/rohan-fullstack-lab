import * as React from 'react';
import Link from 'next/link';
import { siGmail, siGithub, siTelegram, siDiscord } from 'simple-icons/icons';
import { Linkedin } from 'lucide-react';

function IconSVG({
  path,
  className = 'h-5 w-5',
  fill,
}: {
  path: string;
  className?: string;
  fill?: string;
}) {
  return (
    <svg role="img" viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={path} fill={fill ?? 'currentColor'} />
    </svg>
  );
}

export function SocialLinks({ user, ariaLabel }: { user: any; ariaLabel: string }) {
  return (
    <div className="flex gap-4 justify-center sm:justify-start" aria-label={ariaLabel}>
      {user.gmail && (
        <a
          href={`mailto:${user.gmail}`}
          aria-label="Email"
          className="text-[#D14836] hover:text-foreground dark:text-muted-foreground dark:hover:text-[#EA4335] transition-colors"
        >
          <IconSVG path={siGmail.path} />
        </a>
      )}
      {user.linkedinUrl && (
        <a
          href={user.linkedinUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Linkedin className="w-5 h-5" aria-hidden="true" />
        </a>
      )}
      {user.githubUrl && (
        <Link
          href={user.githubUrl}
          target="_blank"
          rel="noreferrer"
          style={{ ['--brand-light' as any]: `#${siGithub.hex}` }}
          className="text-[var(--brand-light)] hover:text-foreground dark:text-muted-foreground dark:hover:text-white transition-colors"
          aria-label="GitHub"
        >
          <IconSVG path={siGithub.path} />
        </Link>
      )}
      {user.telegramUrl && (
        <Link
          href={user.telegramUrl}
          target="_blank"
          rel="noreferrer"
          style={{ ['--brand-light' as any]: `#${siTelegram.hex}` }}
          className="text-[var(--brand-light)] hover:text-foreground dark:text-muted-foreground dark:hover:text-[#26A5E4] transition-colors"
          aria-label="Telegram"
        >
          <IconSVG path={siTelegram.path} />
        </Link>
      )}
      {user.discordUrl && (
        <Link
          href={user.discordUrl}
          target="_blank"
          rel="noreferrer"
          style={{ ['--brand-light' as any]: `#${siDiscord.hex}` }}
          className="text-[var(--brand-light)] hover:text-foreground dark:text-muted-foreground dark:hover:text-[#5865F2] transition-colors"
          aria-label="Discord"
        >
          <IconSVG path={siDiscord.path} />
        </Link>
      )}
    </div>
  );
}
