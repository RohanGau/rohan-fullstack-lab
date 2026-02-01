import { HomeSkeleton } from '../custom/HomeSkeleton';
import { SkillsSection } from '../custom/Skills';
import { ErrorMessage } from '../profile/ErrorMessage';
import { ProfileCard } from '../profile/ProfileCard';
import { useProfile } from '@/hooks/useProfile';

export default function ProfileSection() {
  const { profile, loading, error } = useProfile();
  const user = profile?.find((item) => {
    if (
      item?.architectureAreas &&
      Array.isArray(item.architectureAreas) &&
      item.architectureAreas.length > 0
    ) {
      return true;
    }
    return false;
  });
  if (loading) return <HomeSkeleton />;
  if (error) return <ErrorMessage message="Failed to load profile data." detail={error} />;
  if (!user) return <ErrorMessage message="User profile not available." />;

  return (
    <>
      <ProfileCard user={user} />
      <SkillsSection skills={user.skills} isProfile />
    </>
  );
}
