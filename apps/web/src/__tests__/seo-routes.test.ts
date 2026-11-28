import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetBlogList = vi.fn();
const mockGetProjectList = vi.fn();
const mockGetProfilesCached = vi.fn();

vi.mock('@/lib/server/blogApi', () => ({
  getBlogList: (...args: unknown[]) => mockGetBlogList(...args),
}));

vi.mock('@/lib/server/projectApi', () => ({
  getProjectList: (...args: unknown[]) => mockGetProjectList(...args),
}));

vi.mock('@/lib/server/profileApi', () => ({
  getProfilesCached: (...args: unknown[]) => mockGetProfilesCached(...args),
  pickHomeProfile: (profiles: unknown[]) => (profiles?.[0] as any) ?? null,
}));

import sitemap from '@/app/sitemap';
import { GET as getRss } from '@/app/rss.xml/route';
import { GET as getLlms } from '@/app/llms.txt/route';
import { buildCsp, renderCloudflareHeadersFile } from '../../security-headers.mjs';

describe('SEO & GEO routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sitemap includes static routes and canonical blog/project URLs', async () => {
    mockGetBlogList.mockResolvedValue({
      data: [
        {
          id: '507f1f77bcf86cd799439011',
          slug: 'rsc-architecture',
          updatedAt: '2026-10-01T00:00:00.000Z',
          createdAt: '2026-09-01T00:00:00.000Z',
        },
      ],
      total: 1,
    });
    mockGetProjectList.mockResolvedValue({
      data: [
        {
          id: '507f1f77bcf86cd799439012',
          updatedAt: '2026-10-02T00:00:00.000Z',
          createdAt: '2026-09-02T00:00:00.000Z',
        },
      ],
      total: 1,
    });

    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain('https://rohangautam.dev/');
    expect(urls).toContain('https://rohangautam.dev/about');
    expect(urls).toContain('https://rohangautam.dev/blog');
    expect(urls).toContain('https://rohangautam.dev/project');
    expect(urls).toContain('https://rohangautam.dev/contact');
    expect(urls).toContain('https://rohangautam.dev/blog/rsc-architecture');
    expect(urls).toContain('https://rohangautam.dev/project/507f1f77bcf86cd799439012');
  });

  it('sitemap falls back to static routes if API fails', async () => {
    mockGetBlogList.mockRejectedValue(new Error('Network error'));
    mockGetProjectList.mockRejectedValue(new Error('Network error'));

    const entries = await sitemap();
    expect(entries.length).toBe(5);
  });

  it('rss.xml uses canonical slug URLs, strips markdown, and sets cache headers', async () => {
    mockGetBlogList.mockResolvedValue({
      data: [
        {
          id: '507f1f77bcf86cd799439011',
          slug: 'clean-react-patterns',
          title: 'Clean React & Next.js',
          content: '# Heading\n\n**Bold** details',
          summary: '',
          author: 'Rohan Kumar',
          publishedAt: '2026-10-01T00:00:00.000Z',
          createdAt: '2026-10-01T00:00:00.000Z',
        },
      ],
      total: 1,
    });

    const res = await getRss();
    const body = await res.text();

    expect(res.headers.get('Content-Type')).toContain('application/rss+xml');
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=3600');
    expect(body).toContain('<link>https://rohangautam.dev/blog/clean-react-patterns</link>');
    expect(body).toContain('<title>Clean React &amp; Next.js</title>');
    expect(body).toContain('<description>Heading Bold details</description>');
    expect(body).not.toContain('**Bold**');
  });

  it('llms.txt exposes structured Markdown index with core links', async () => {
    mockGetProfilesCached.mockResolvedValue([{ name: 'Rohan Kumar', bio: 'Frontend Architect' }]);
    mockGetProjectList.mockResolvedValue({
      data: [{ id: 'proj1', title: 'Lab Portal', description: 'Next.js monorepo' }],
    });
    mockGetBlogList.mockResolvedValue({
      data: [{ id: 'b1', slug: 'edge-ssr', title: 'Edge SSR Guide', summary: 'Fast rendering' }],
    });

    const res = await getLlms();
    const text = await res.text();

    expect(res.headers.get('Content-Type')).toContain('text/plain');
    expect(text).toContain('# Rohan Kumar');
    expect(text).toContain('https://rohangautam.dev/about');
    expect(text).toContain('https://rohangautam.dev/project/proj1');
    expect(text).toContain('https://rohangautam.dev/blog/edge-ssr');
  });

  it('security headers omit unsafe-eval in prod, tighten img-src, and stay synced with _headers', () => {
    const prodCsp = buildCsp({ isDev: false });
    expect(prodCsp).not.toContain('unsafe-eval');
    expect(prodCsp).not.toContain("img-src 'self' data: https:");
    expect(prodCsp).toContain('https://assets.rohangautam.dev');

    const headersFile = fs.readFileSync(path.resolve(process.cwd(), 'public/_headers'), 'utf8');
    expect(headersFile).toBe(renderCloudflareHeadersFile());
    expect(headersFile).not.toContain('X-XSS-Protection');
  });
});
