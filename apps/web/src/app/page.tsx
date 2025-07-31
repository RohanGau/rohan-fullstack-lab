'use client';
import { useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { ProjectsPreview } from '@/components/custom/ProjectsPreview';
import { BlogsPreview } from '@/components/custom/BlogsPreview';
import { useFeaturedBlogs } from '@/hooks/useFeaturedBlogs';
import { ProfileSection } from '@/components/home/ProfileSection';

export default function Home() {
  const {
    profile,
    loading: isProfileLoading,
    error: profileError
  } = useProfile();
  const {
    featureBlogs,
    loading: isFeatureBlogsLoading,
    error: featureBlogsError
  } = useFeaturedBlogs();
  const user = profile?.[0];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-16">
     <ProfileSection user={user} loading={isProfileLoading} error={profileError} />

      {/* Projects Section */}
      <ProjectsPreview />

      {/* Blog Section */}
      <BlogsPreview featureBlogs={featureBlogs} loading={isFeatureBlogsLoading} error={featureBlogsError} />
    </div>
  );
}
