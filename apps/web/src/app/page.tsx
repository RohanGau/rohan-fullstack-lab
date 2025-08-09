'use client';

import { BlogListSkeleton } from '@/components/blog/BlogListSkeleton';
import { HomeSkeleton } from '@/components/custom/HomeSkeleton';
import { withClientFallback } from '@/lib/hoc/withClientFallback';

const ProfileSection = withClientFallback(
  () => import('@/components/home/ProfileSection'),
  { fallback: <HomeSkeleton /> }
);

const ProjectsPreview = withClientFallback(
  () => import('@/components/custom/ProjectsPreview'),
  { fallback: <BlogListSkeleton numberOfSkeletons={3} /> }
);

const BlogsPreview = withClientFallback(
  () => import('@/components/custom/BlogsPreview'),
  { fallback: <BlogListSkeleton numberOfSkeletons={3} /> }
);

export default function HomeContent() {

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-16">
      <ProfileSection />
      <ProjectsPreview />
      <BlogsPreview />
    </div>
  );
}