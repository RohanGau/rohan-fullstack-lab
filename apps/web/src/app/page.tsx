'use client';

import { BlogListSkeleton } from '@/components/blog/BlogListSkeleton';
import { HomeSkeleton } from '@/components/custom/HomeSkeleton';
import { ErrorMessage } from '@/components/profile/ErrorMessage';
import { withClientFallback } from '@/lib/hoc/withClientFallback';

const ProfileSection = withClientFallback(() => import('@/components/home/ProfileSection'), {
  fallback: <HomeSkeleton />,
  errorFallback: <ErrorMessage message="Failed to load profile data." />,
});

const ProjectsPreview = withClientFallback(() => import('@/components/custom/ProjectsPreview'), {
  fallback: <BlogListSkeleton numberOfSkeletons={3} />,
  errorFallback: <ErrorMessage message="Failed to load projects." />,
});

const BlogsPreview = withClientFallback(() => import('@/components/custom/BlogsPreview'), {
  fallback: <BlogListSkeleton numberOfSkeletons={3} />,
  errorFallback: <ErrorMessage message="Failed to load blogs." />,
});

export default function HomeContent() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // Log them for debugging
  console.log("API URL:", apiUrl);
  console.log("CDN URL:", cdnUrl);
  console.log("SITE URL:", siteUrl);
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-16">
      <ProfileSection />
      <ProjectsPreview />
      <BlogsPreview />
    </div>
  );
}
