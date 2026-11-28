import Image from 'next/image';
import type { IProfileDto } from '@fullstack-lab/types';
import { Card, CardContent } from '@/components/ui/card';
import { Hero } from './Hero';
import { SkillsSection } from '../custom/Skills';
import { Knowledge } from './Knowledge';
import { Separator } from '../ui/separator';
import { Philosophy } from './Philosophy';
import { SocialLinksContainer } from './SocialLinks';
import { ErrorMessage } from '../profile/ErrorMessage';

interface AboutContentProps {
  user: IProfileDto | null;
  error?: string | null;
}

export default function AboutContent({ user, error }: AboutContentProps) {
  if (error) {
    return <ErrorMessage message="Failed to load about page." detail={error} />;
  }
  if (!user) {
    return <ErrorMessage message="Profile information is currently unavailable." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <Card className="mb-6 sm:mb-10 shadow-lg">
        <Hero title="About Me" description={user.title} heading={user.name} />
        <CardContent>
          <div className="mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed space-y-2">
            <p>{user.bio}</p>
          </div>
          <SkillsSection skills={user.skills} fullStack={user.allTechStack} />
          <Knowledge areas={user.architectureAreas} />
          <Separator className="my-6 sm:my-8" />
          <Philosophy text={user.philosophy} impact={user.impact} />
          <SocialLinksContainer user={user} />
        </CardContent>
      </Card>
      <div className="flex justify-center">
        <Image
          src={user.avatarUrl ?? '/profile.jpg'}
          alt={user.name}
          width={448}
          height={448}
          sizes="(max-width: 768px) 100vw, 448px"
          className="rounded-xl drop-shadow w-full max-w-md border object-cover"
          priority
        />
      </div>
    </div>
  );
}
