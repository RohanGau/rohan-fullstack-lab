import type { MetadataRoute } from 'next';
import { getBlogList } from '@/lib/server/blogApi';
import { getProjectList } from '@/lib/server/projectApi';
import { siteUrl } from '@/lib/constant';

export const runtime = 'edge';
export const revalidate = 3600;

async function fetchAllBlogs() {
  const blogs = [];
  let page = 1;
  const perPage = 50;

  while (true) {
    const { data, total } = await getBlogList({
      page,
      perPage,
      status: 'published',
      sort: ['publishedAt', 'DESC'],
    });
    blogs.push(...data);
    if (blogs.length >= total || data.length < perPage) break;
    page += 1;
  }

  return blogs;
}

async function fetchAllProjects() {
  const projects = [];
  let page = 1;
  const perPage = 50;

  while (true) {
    const { data, total } = await getProjectList({
      page,
      perPage,
      sort: ['createdAt', 'DESC'],
    });
    projects.push(...data);
    if (projects.length >= total || data.length < perPage) break;
    page += 1;
  }

  return projects;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/project`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const [blogsResult, projectsResult] = await Promise.allSettled([
    fetchAllBlogs(),
    fetchAllProjects(),
  ]);

  const blogRoutes: MetadataRoute.Sitemap =
    blogsResult.status === 'fulfilled'
      ? blogsResult.value.map((post) => ({
          url: `${siteUrl}/blog/${post.slug || post.id}`,
          lastModified: new Date(post.updatedAt || post.publishedAt || post.createdAt),
          changeFrequency: 'weekly',
          priority: 0.8,
        }))
      : [];

  const projectRoutes: MetadataRoute.Sitemap =
    projectsResult.status === 'fulfilled'
      ? projectsResult.value.map((project) => ({
          url: `${siteUrl}/project/${project.id}`,
          lastModified: new Date(project.updatedAt || project.createdAt),
          changeFrequency: 'monthly',
          priority: 0.7,
        }))
      : [];

  return [...staticRoutes, ...blogRoutes, ...projectRoutes];
}
