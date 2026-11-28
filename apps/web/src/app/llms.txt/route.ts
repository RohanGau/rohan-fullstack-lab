import { stripMarkdown } from '@fullstack-lab/constants';
import { getBlogList } from '@/lib/server/blogApi';
import { getProjectList } from '@/lib/server/projectApi';
import { getProfilesCached, pickHomeProfile } from '@/lib/server/profileApi';
import { siteUrl } from '@/lib/constant';

export const runtime = 'edge';

export async function GET() {
  const [profileRes, projectsRes, blogsRes] = await Promise.allSettled([
    getProfilesCached(),
    getProjectList({ page: 1, perPage: 10, sort: ['createdAt', 'DESC'] }),
    getBlogList({ page: 1, perPage: 15, status: 'published', sort: ['publishedAt', 'DESC'] }),
  ]);

  const profile = profileRes.status === 'fulfilled' ? pickHomeProfile(profileRes.value) : null;
  const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data : [];
  const blogs = blogsRes.status === 'fulfilled' ? blogsRes.value.data : [];

  const summary =
    profile?.bio?.trim() ||
    'Senior Software Engineer specializing in frontend architecture, performance, React, Next.js, TypeScript, and scalable design systems.';

  const lines: string[] = [
    '# Rohan Kumar — Senior Software Engineer',
    '',
    `> ${summary}`,
    '',
    '## Core Pages',
    `- [Home](${siteUrl}/): Profile overview, core skills, featured projects, and featured technical articles.`,
    `- [About](${siteUrl}/about): Engineering philosophy, full tech stack, architecture expertise, and career impact.`,
    `- [Projects](${siteUrl}/project): Portfolio of production systems, open-source tools, and full-stack case studies.`,
    `- [Blog](${siteUrl}/blog): Technical writing on frontend architecture, React, Next.js, TypeScript, and system design.`,
    `- [Contact](${siteUrl}/contact): Contact form and meeting booking.`,
    `- [RSS Feed](${siteUrl}/rss.xml): Syndicated XML feed of published articles.`,
    `- [Sitemap](${siteUrl}/sitemap.xml): Canonical XML sitemap.`,
    '',
  ];

  if (projects.length > 0) {
    lines.push('## Featured & Recent Projects');
    for (const project of projects) {
      const desc = stripMarkdown(project.description || '').slice(0, 140);
      lines.push(
        `- [${project.title}](${siteUrl}/project/${project.id})${desc ? `: ${desc}` : ''}`
      );
    }
    lines.push('');
  }

  if (blogs.length > 0) {
    lines.push('## Published Articles');
    for (const post of blogs) {
      const canonical = `${siteUrl}/blog/${post.slug || post.id}`;
      const desc = stripMarkdown(post.summary?.trim() || post.content || '').slice(0, 140);
      lines.push(`- [${post.title}](${canonical})${desc ? `: ${desc}` : ''}`);
    }
    lines.push('');
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
