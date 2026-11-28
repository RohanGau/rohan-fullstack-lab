import { PERMISSIONS } from '@fullstack-lab/constants';

const P = PERMISSIONS;

/** The seeded Roles and what each holds, as the SSO and RBAC spec defines them. */
export const ROLE_ACCESS = {
  super_admin: { roles: ['super_admin'], permissions: Object.values(P) as string[] },
  admin: { roles: ['admin'], permissions: Object.values(P) as string[] },
  content_manager: {
    roles: ['content_manager'],
    permissions: [
      P.BLOG_CREATE,
      P.BLOG_UPDATE,
      P.BLOG_DELETE,
      P.PROJECT_CREATE,
      P.PROJECT_UPDATE,
      P.PROJECT_DELETE,
      P.PROFILE_CREATE,
      P.PROFILE_UPDATE,
      P.PROFILE_DELETE,
      P.UPLOAD_CREATE,
      P.UPLOAD_DELETE,
    ] as string[],
  },
  inbox_manager: {
    roles: ['inbox_manager'],
    permissions: [
      P.CONTACT_READ,
      P.CONTACT_DELETE,
      P.SLOT_READ,
      P.SLOT_UPDATE,
      P.SLOT_DELETE,
    ] as string[],
  },
  viewer: { roles: ['viewer'], permissions: [P.CONTACT_READ, P.SLOT_READ] as string[] },
};

export type SeededRole = keyof typeof ROLE_ACCESS;

const EVERYWHERE = [
  'Account',
  'Assets',
  'Blogs',
  'Contacts',
  'Operators',
  'Overview',
  'Profiles',
  'Projects',
  'Roles',
  'Slots',
];

/** The navigation links each Role should see, sorted. */
export const EXPECTED_NAVIGATION: Record<SeededRole, string[]> = {
  super_admin: EVERYWHERE,
  admin: EVERYWHERE,
  content_manager: ['Account', 'Assets', 'Blogs', 'Overview', 'Profiles', 'Projects'],
  inbox_manager: ['Account', 'Contacts', 'Overview', 'Slots'],
  viewer: ['Account', 'Contacts', 'Overview', 'Slots'],
};
