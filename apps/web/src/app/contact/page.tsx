import { ContactTabs } from '@/components/contact/ContactTabs';
import { FooterMap } from '@/components/custom/FooterMap';
import { getProfilesCached, pickHomeProfile } from '@/lib/server/profileApi';

export const runtime = 'edge';
export const revalidate = 300;

export default async function ContactPage() {
  let location: string | undefined;
  try {
    const profiles = await getProfilesCached();
    location = pickHomeProfile(profiles)?.location;
  } catch {
    location = undefined;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-6">
      <h1 className="text-3xl font-bold text-center">Get in touch</h1>
      <ContactTabs />
      <FooterMap location={location} zoom={13} />
    </div>
  );
}
