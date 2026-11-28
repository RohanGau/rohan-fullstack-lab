import { describe, it, expect } from 'vitest';
import { AUTHOR_PROFILE, API_PATHS, WEB_ROUTES } from '@fullstack-lab/constants';
import { API, CONTACTS, navItems, siteUrl } from '@/lib/constant';
import { isActive } from '@/lib/navigation';
import {
  makeBlogQueryString,
  makeProjectQueryString,
  parsePositiveInt,
  pickSearchParam,
} from '@/lib/query';
import { getSimpleIconByName, getSimpleIconSlug } from '@/lib/simpleIcons';

describe('web constants & domain helpers', () => {
  it('derives web API, contacts, and nav constants from @fullstack-lab/constants', () => {
    expect(siteUrl).toBe('https://rohangautam.dev');
    expect(CONTACTS.githubUrl).toBe('https://github.com/RohanGau');
    expect(CONTACTS.githubUrl).toBe(AUTHOR_PROFILE.GITHUB_URL);
    expect(API.BLOGS).toBe(API_PATHS.BLOGS);
    expect(API.CONTACT).toBe(API_PATHS.CONTACT);
    expect(API.SLOTS).toBe(API_PATHS.SLOTS);
    expect(navItems.some((item) => item.href === WEB_ROUTES.BLOG)).toBe(true);
  });

  it('computes active navigation state', () => {
    expect(isActive('/', '/')).toBe(true);
    expect(isActive('/blog', '/')).toBe(false);
    expect(isActive('/blog/my-post', '/blog')).toBe(true);
    expect(isActive('/blog-other', '/blog')).toBe(false);
  });

  it('builds blog/project query strings and parses search params', () => {
    expect(pickSearchParam(['first', 'second'])).toBe('first');
    expect(parsePositiveInt('3', 1)).toBe(3);
    expect(parsePositiveInt('-5', 1)).toBe(1);

    const blogQs = makeBlogQueryString({
      page: 2,
      perPage: 10,
      sort: ['publishedAt', 'DESC'],
      status: 'published',
      tags: ['nextjs'],
    });
    expect(blogQs).toContain('range=%5B10%2C19%5D');
    expect(blogQs).toContain('nextjs');

    const projQs = makeProjectQueryString({
      page: 1,
      perPage: 6,
      sort: ['createdAt', 'DESC'],
      types: ['web'],
    });
    expect(projQs).toContain('range=%5B0%2C5%5D');
    expect(projQs).toContain('web');
  });

  it('resolves simple-icons slugs and glyphs', () => {
    expect(getSimpleIconSlug('Next.js')).toBe('nextdotjs');
    expect(getSimpleIconSlug('TypeScript')).toBe('typescript');
    expect(getSimpleIconByName('React')).toBeDefined();
  });
});
