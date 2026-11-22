import { PERMISSIONS, type Permission } from '@fullstack-lab/constants';

const P = PERMISSIONS;

export interface Section {
  readonly path: string;
  readonly label: string;
  readonly group: 'Content' | 'Inbox' | 'Access';
  /** An Operator holding any one of these may open the section. */
  readonly anyOf: readonly Permission[];
}

/** Every section of the Admin panel and what it takes to open it. One place, used by routes and navigation. */
export const SECTIONS = {
  blogs: {
    path: '/blogs',
    label: 'Blogs',
    group: 'Content',
    anyOf: [P.BLOG_CREATE, P.BLOG_UPDATE, P.BLOG_DELETE],
  },
  projects: {
    path: '/projects',
    label: 'Projects',
    group: 'Content',
    anyOf: [P.PROJECT_CREATE, P.PROJECT_UPDATE, P.PROJECT_DELETE],
  },
  profiles: {
    path: '/profiles',
    label: 'Profiles',
    group: 'Content',
    anyOf: [P.PROFILE_CREATE, P.PROFILE_UPDATE, P.PROFILE_DELETE],
  },
  assets: {
    path: '/assets',
    label: 'Assets',
    group: 'Content',
    anyOf: [P.UPLOAD_CREATE, P.UPLOAD_DELETE],
  },
  contacts: {
    path: '/contacts',
    label: 'Contacts',
    group: 'Inbox',
    anyOf: [P.CONTACT_READ, P.CONTACT_DELETE],
  },
  slots: {
    path: '/slots',
    label: 'Slots',
    group: 'Inbox',
    anyOf: [P.SLOT_READ, P.SLOT_UPDATE, P.SLOT_DELETE],
  },
  operators: {
    path: '/operators',
    label: 'Operators',
    group: 'Access',
    anyOf: [P.OPERATOR_READ],
  },
  roles: { path: '/roles', label: 'Roles', group: 'Access', anyOf: [P.ROLE_MANAGE] },
} as const satisfies Record<string, Section>;

export const SECTION_LIST: readonly Section[] = Object.values(SECTIONS);
export const SECTION_GROUPS = ['Content', 'Inbox', 'Access'] as const;
