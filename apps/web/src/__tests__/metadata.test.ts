import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetBlogDetailCached = vi.fn();
const mockGetProjectByIdCached = vi.fn();

vi.mock('@/lib/server/blogApi', () => ({
  getBlogDetailCached: (...args: unknown[]) => mockGetBlogDetailCached(...args),
  getRelatedPostsCached: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/server/projectApi', () => ({
  getProjectByIdCached: (...args: unknown[]) => mockGetProjectByIdCached(...args),
  getRelatedProjectsCached: vi.fn().mockResolvedValue([]),
}));

import { generateMetadata as generateBlogMetadata } from '@/app/blog/[id]/page';
import { generateMetadata as generateProjectMetadata } from '@/app/project/[id]/page';

describe('Detail route generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports and computes blog detail metadata with canonical slug', async () => {
    mockGetBlogDetailCached.mockResolvedValue({
      id: '507f1f77bcf86cd799439011',
      slug: 'edge-caching-2026',
      title: 'Edge Caching in 2026',
      summary: 'Deep dive into Cloudflare Pages and Next.js ISR.',
      content: '# Content',
      author: 'Rohan Kumar',
      tags: ['Next.js', 'Edge'],
      status: 'published',
      publishedAt: '2026-10-10T00:00:00.000Z',
      updatedAt: '2026-10-12T00:00:00.000Z',
      coverImageUrl: 'https://assets.rohangautam.dev/cover.png',
    });

    const meta = await generateBlogMetadata({
      params: Promise.resolve({ id: 'edge-caching-2026' }),
    });

    expect(meta.title).toBe('Edge Caching in 2026 · Rohan Kumar');
    expect(meta.description).toBe('Deep dive into Cloudflare Pages and Next.js ISR.');
    expect(meta.alternates?.canonical).toBe('/blog/edge-caching-2026');
    expect(meta.openGraph).toMatchObject({
      type: 'article',
      url: '/blog/edge-caching-2026',
    });
  });

  it('computes project detail metadata and strips markdown', async () => {
    const projectId = '507f1f77bcf86cd799439011';
    mockGetProjectByIdCached.mockResolvedValue({
      id: projectId,
      title: 'Fullstack Lab',
      description: '## Overview\n\nA **high-scale** [monorepo](https://rohangautam.dev).',
      types: ['web'],
      techStack: ['Next.js', 'TypeScript'],
      thumbnailUrl: 'https://assets.rohangautam.dev/proj.png',
    });

    const meta = await generateProjectMetadata({
      params: Promise.resolve({ id: projectId }),
    });

    expect(meta.title).toBe('Fullstack Lab');
    expect(meta.description).toBe('Overview A highscale https://rohangautam.dev.');
    expect(meta.alternates?.canonical).toBe(`/project/${projectId}`);
    expect(meta.robots).toEqual({ index: true, follow: true });
  });

  it('marks invalid project id as noindex', async () => {
    const meta = await generateProjectMetadata({
      params: Promise.resolve({ id: 'invalid-id' }),
    });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });
});
