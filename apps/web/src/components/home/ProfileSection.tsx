import type { IProfileDto } from '@fullstack-lab/types';
import { SkillsSection } from '../custom/Skills';
import { ErrorMessage } from '../profile/ErrorMessage';
import { ProfileCard } from '../profile/ProfileCard';

interface ProfileSectionProps {
  user: IProfileDto | null;
  error?: string | null;
}

export default function ProfileSection({ user, error }: ProfileSectionProps) {
  if (error) return <ErrorMessage message="Failed to load profile data." detail={error} />;
  if (!user) return <ErrorMessage message="User profile not available." />;

  return (
    <>
      <ProfileCard user={user} />
      <SkillsSection skills={user.skills} isProfile />
    </>
  );
}
