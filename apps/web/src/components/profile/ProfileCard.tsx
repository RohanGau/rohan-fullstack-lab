import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SocialLinks } from '../custom/SocialLinks';
import { CONTACTS } from '@/lib/constant';
import { IProfileDto } from '@fullstack-lab/types';

export function ProfileCard({ user }: { user: IProfileDto }) {
  return (
    <section className="relative bg-muted/30 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-10 shadow-sm">
      <Image
        src={user.avatarUrl ?? '/profile.jpg'}
        alt={user.name}
        width={250}
        height={250}
        className="rounded-xl object-cover w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 shadow-md"
        priority
      />

      <div className="text-center md:text-left space-y-4 max-w-xl">
        <h1 className="text-4xl font-bold leading-tight">{user.name}</h1>
        <p className="text-primary text-lg font-medium">{user.title}</p>
        <p className="text-muted-foreground text-pretty text-sm leading-relaxed">{user.bio}</p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-3 pt-6">
          <SocialLinks user={{ ...user, ...CONTACTS }} />

          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              Download Resume
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
