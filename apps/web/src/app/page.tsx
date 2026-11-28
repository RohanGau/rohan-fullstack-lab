import ProfileSection from '@/components/home/ProfileSection';
import ProjectsPreview from '@/components/custom/ProjectsPreview';
import BlogsPreview from '@/components/custom/BlogsPreview';
import { getProfilesCached, pickHomeProfile } from '@/lib/server/profileApi';
import { getProjectList } from '@/lib/server/projectApi';
import { getBlogList } from '@/lib/server/blogApi';
import { getErrorMessage } from '@fullstack-lab/constants';

export const runtime = 'edge';
export const revalidate = 60;

export default async function HomePage() {
  const [profilesResult, projectsResult, blogsResult] = await Promise.allSettled([
    getProfilesCached(),
    getProjectList({
      page: 1,
      perPage: 3,
      isFeatured: true,
      sort: ['createdAt', 'DESC'],
    }),
    getBlogList({
      page: 1,
      perPage: 3,
      isFeatured: true,
      status: 'published',
      sort: ['publishedAt', 'DESC'],
    }),
  ]);

  const user = profilesResult.status === 'fulfilled' ? pickHomeProfile(profilesResult.value) : null;
  const profileError =
    profilesResult.status === 'rejected' ? getErrorMessage(profilesResult.reason) : null;

  const projects = projectsResult.status === 'fulfilled' ? projectsResult.value.data : [];
  const projectsError =
    projectsResult.status === 'rejected' ? getErrorMessage(projectsResult.reason) : null;

  const blogs = blogsResult.status === 'fulfilled' ? blogsResult.value.data : [];
  const blogsError = blogsResult.status === 'rejected' ? getErrorMessage(blogsResult.reason) : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-16">
      <ProfileSection user={user} error={profileError} />
      <ProjectsPreview projects={projects} error={projectsError} />
      <BlogsPreview blogs={blogs} error={blogsError} />
    </div>
  );
}
