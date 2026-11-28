import AboutContent from '@/components/about/AboutContent';
import { getProfilesCached, pickAboutProfile } from '@/lib/server/profileApi';
import { getErrorMessage } from '@fullstack-lab/constants';

export const runtime = 'edge';
export const revalidate = 60;

export default async function AboutPage() {
  let user = null;
  let error: string | null = null;

  try {
    const profiles = await getProfilesCached();
    user = pickAboutProfile(profiles);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return <AboutContent user={user} error={error} />;
}
