import { HomeSkeleton } from '../custom/HomeSkeleton';
import { SkillsSection } from '../custom/Skills';
import { ProfileSectionProps } from '@/types/profile';
import { ErrorMessage } from '../profile/ErrorMessage';
import { ProfileCard } from '../profile/ProfileCard';

export function ProfileSection({ user, loading, error }: ProfileSectionProps) {
  if (loading) return <HomeSkeleton />;
  if (error) return <ErrorMessage message="Failed to load profile data." detail={error} />;
  if (!user) return <ErrorMessage message="User profile not available." />;

  return (
    <>
      <ProfileCard user={user} />
      <SkillsSection skills={user.skills} />
    </>
  );
}
