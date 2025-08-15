import Image from 'next/image';
import { SocialLinks } from '../custom/SocialLinks';
import { CONTACTS } from '@/lib/constant';
import { IProfileDto } from '@fullstack-lab/types';
import { ResumeActions } from './ResumeAction';
import { resume } from '@/lib/constant';
import { MapPin } from 'lucide-react';

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
        {user.location && (
          <>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>{user.location}</span>
            </span>
          </>
        )}
        <p className="text-muted-foreground text-pretty text-sm leading-relaxed">{user.bio}</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-3 pt-6">
          <SocialLinks user={{ ...user, ...CONTACTS }} ariaLabel="Social links" />
          <ResumeActions url={resume} />
        </div>
      </div>
    </section>
  );
}
