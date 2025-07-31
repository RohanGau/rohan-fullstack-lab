import { SocialIcon } from "./SocialIcon";
import * as simpleIcons from 'simple-icons';
import { Linkedin } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SocialLinks({ user }: { user: any }) {
  return (
    <div className="flex gap-4 justify-center sm:justify-start">
        {user.gmail && (
        <a
          href={`mailto:${user.gmail}`}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          {/* Gmail Icon */}
          <span
            className="w-5 h-5"
            dangerouslySetInnerHTML={{
              __html: simpleIcons.siGmail.svg?.replace(/fill="[^"]*"/g, 'fill="#D14836"'),
            }}
          />
        </a>
      )}
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
      {user.githubUrl && <SocialIcon name="github" url={user.githubUrl} />}
      {user.telegramUrl && <SocialIcon name="telegram" url={user.telegramUrl} />}
      {user.discordUrl && <SocialIcon name="discord" url={user.discordUrl} />}
    </div>
  );
}