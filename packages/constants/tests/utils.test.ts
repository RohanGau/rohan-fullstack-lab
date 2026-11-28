import { describe, expect, it } from 'vitest';
import {
  BLOG_STATUS,
  PERMISSIONS,
  PERMISSION_VALUES,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  isOneOf,
  isPermission,
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
