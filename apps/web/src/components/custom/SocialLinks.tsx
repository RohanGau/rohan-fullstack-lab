import * as React from 'react';
import Link from 'next/link';
import { useEffectiveTheme } from '@/hooks/useEffectiveTheme';
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
  const theme = useEffectiveTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex gap-4 justify-center sm:justify-start" aria-label={ariaLabel}>
      {user.gmail &&
        (isDark ? (
          <a href={`mailto:${user.gmail}`} className="text-muted-foreground hover:text-[#EA4335]">
            <IconSVG path={siGmail.path} />
          </a>
        ) : (
          <a href={`mailto:${user.gmail}`} className="text-muted-foreground hover:text-foreground">
            <IconSVG path={siGmail.path} fill="#D14836" />
          </a>
        ))}
      {user.linkedinUrl && (
        <a
          href={user.linkedinUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
          className="text-muted-foreground hover:text-foreground"
        >
          <Linkedin className="w-5 h-5" />
        </a>
      )}
      {user.githubUrl &&
        (isDark ? (
          <Link
            href={user.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-white"
            aria-label="GitHub"
          >
            <IconSVG path={siGithub.path} />
          </Link>
        ) : (
          <Link
            href={user.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
            aria-label="GitHub"
          >
            <IconSVG path={siGithub.path} fill={`#${siGithub.hex}`} />
          </Link>
        ))}
      {user.telegramUrl &&
        (isDark ? (
          <Link
            href={user.telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-[#26A5E4]"
            aria-label="Telegram"
          >
            <IconSVG path={siTelegram.path} />
          </Link>
        ) : (
          <Link
            href={user.telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Telegram"
          >
            <IconSVG path={siTelegram.path} fill={`#${siTelegram.hex}`} />
          </Link>
        ))}
      {user.discordUrl &&
        (isDark ? (
          <Link
            href={user.discordUrl}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-[#5865F2]"
            aria-label="Discord"
          >
            <IconSVG path={siDiscord.path} />
          </Link>
        ) : (
          <Link
            href={user.discordUrl}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Discord"
          >
            <IconSVG path={siDiscord.path} fill={`#${siDiscord.hex}`} />
          </Link>
        ))}
    </div>
  );
}
