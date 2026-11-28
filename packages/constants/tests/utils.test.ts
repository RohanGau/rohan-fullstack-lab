import { describe, expect, it } from 'vitest';
import {
  AUTHOR_PROFILE,
  BLOG_STATUS,
  PERMISSIONS,
  PERMISSION_VALUES,
  PRIMARY_NAV_ITEMS,
  SITE_URL,
  WEB_ROUTES,
  arrToCsv,
  csvToArr,
  extractApiErrors,
  getErrorMessage,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  isAbortError,
  isMongoId,
  isOneOf,
  isPermission,
  pickPrimaryLink,
  stripMarkdown,
  truncate,
  valuesOf,
} from '../src';

describe('valuesOf', () => {
  it('returns every value of a constants object', () => {
    expect([...valuesOf(BLOG_STATUS)].sort()).toEqual(['archived', 'draft', 'published']);
  });
});

describe('isOneOf', () => {
  it('accepts listed values and rejects everything else', () => {
    const modes = ['sync', 'queue'] as const;
    expect(isOneOf(modes, 'sync')).toBe(true);
    expect(isOneOf(modes, 'dual')).toBe(false);
    expect(isOneOf(modes, undefined)).toBe(false);
  });
});

describe('permission catalogue', () => {
  it('lists exactly the permissions the access model defines', () => {
    expect(PERMISSION_VALUES).toHaveLength(23);
    expect(PERMISSION_VALUES).toContain('blog:create');
    expect(PERMISSION_VALUES).toContain('operator:assign-role');
    expect(PERMISSION_VALUES).toContain('diagnostics:run');
  });

  it('isPermission recognises catalogue entries only', () => {
    expect(isPermission('role:manage')).toBe(true);
    expect(isPermission('role:invent')).toBe(false);
    expect(isPermission(42)).toBe(false);
  });
});

describe('permission checks', () => {
  const granted = ['blog:create', 'blog:update'];

  it('hasPermission checks a single permission', () => {
    expect(hasPermission(granted, PERMISSIONS.BLOG_CREATE)).toBe(true);
    expect(hasPermission(granted, PERMISSIONS.BLOG_DELETE)).toBe(false);
  });

  it('hasAllPermissions requires every permission', () => {
    expect(hasAllPermissions(granted, [PERMISSIONS.BLOG_CREATE, PERMISSIONS.BLOG_UPDATE])).toBe(
      true
    );
    expect(hasAllPermissions(granted, [PERMISSIONS.BLOG_CREATE, PERMISSIONS.BLOG_DELETE])).toBe(
      false
    );
    expect(hasAllPermissions(granted, [])).toBe(true);
  });

  it('hasAnyPermission requires at least one permission', () => {
    expect(hasAnyPermission(granted, [PERMISSIONS.BLOG_DELETE, PERMISSIONS.BLOG_UPDATE])).toBe(
      true
    );
    expect(hasAnyPermission(granted, [PERMISSIONS.BLOG_DELETE])).toBe(false);
    expect(hasAnyPermission(granted, [])).toBe(false);
  });
});

describe('site constants', () => {
  it('exports canonical site metadata and navigation', () => {
    expect(SITE_URL).toBe('https://rohangautam.dev');
    expect(AUTHOR_PROFILE.GITHUB_URL).toBe('https://github.com/RohanGau');
    expect(PRIMARY_NAV_ITEMS.map((item) => item.href)).toContain(WEB_ROUTES.BLOG);
  });
});

describe('shared helpers', () => {
  it('validates Mongo ObjectIds', () => {
    expect(isMongoId('507f1f77bcf86cd799439011')).toBe(true);
    expect(isMongoId('my-blog-slug')).toBe(false);
  });

  it('strips markdown and truncates cleanly', () => {
    const md = '# Heading\n\nSome **bold** text and [link](https://example.com) with `code`.';
    expect(stripMarkdown(md)).toBe('Heading Some bold text and https://example.com with code.');
    expect(truncate('hello world', 5)).toBe('hello…');
  });

  it('serializes and parses CSV strings', () => {
    expect(arrToCsv(['react', 'nextjs'])).toBe('react,nextjs');
    expect(csvToArr(' react , nextjs , ')).toEqual(['react', 'nextjs']);
  });

  it('extracts error messages, abort checks, and API field errors', () => {
    expect(getErrorMessage(new Error('Boom'))).toBe('Boom');
    expect(getErrorMessage({ msg: 'Denied' })).toBe('Denied');
    expect(isAbortError(Object.assign(new Error('aborted'), { name: 'AbortError' }))).toBe(true);
    expect(
      extractApiErrors({
        response: {
          data: {
            msg: 'Validation failed',
            errors: [{ field: 'email', message: 'Invalid email' }],
          },
        },
      })
    ).toEqual({
      global: 'Validation failed',
      fieldErrors: { email: 'Invalid email' },
    });
  });

  it('picks primary project link in priority order', () => {
    expect(
      pickPrimaryLink([
        { kind: 'repo', url: 'https://github.com/RohanGau/repo' },
        { kind: 'live', url: 'https://rohangautam.dev' },
      ])
    ).toEqual({ kind: 'live', url: 'https://rohangautam.dev' });
    expect(pickPrimaryLink([])).toBeNull();
  });
});
