import { HomeSkeleton } from '../custom/HomeSkeleton';
import { SkillsSection } from '../custom/Skills';
import { ErrorMessage } from '../profile/ErrorMessage';
import { ProfileCard } from '../profile/ProfileCard';
import { useProfile } from '@/hooks/useProfile';

export default function ProfileSection() {
  const { profile, loading, error } = useProfile();
  const user = profile?.find((item) => item.id === '688a63c9e76b322b8c0b5814') ?? null;
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
