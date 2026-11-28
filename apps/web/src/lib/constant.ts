import {
  API_PATHS,
  AUTHOR_PROFILE,
  PRIMARY_NAV_ITEMS,
  SITE_URL,
  WEB_ROUTES,
} from '@fullstack-lab/constants';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const CDN_LINK = process.env.NEXT_PUBLIC_CDN_URL;
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string;

export const API = {
  PROFILE: API_PATHS.PROFILES,
  PROJECTS: API_PATHS.PROJECTS,
  BLOGS: API_PATHS.BLOGS,
  CONTACT: API_PATHS.CONTACT,
  SLOTS: API_PATHS.SLOTS,
} as const;

export const CONTACTS = {
  gmail: AUTHOR_PROFILE.EMAIL,
  githubUrl: AUTHOR_PROFILE.GITHUB_URL,
  linkedinUrl: AUTHOR_PROFILE.LINKEDIN_URL,
  telegramUrl: AUTHOR_PROFILE.TELEGRAM_URL,
  discordUrl: AUTHOR_PROFILE.DISCORD_URL,
} as const;

export const navItems = PRIMARY_NAV_ITEMS;

export const revalidate = 3600;
export const siteUrl = SITE_URL;
export { AUTHOR_PROFILE, WEB_ROUTES };

export const logoUrl = `${CDN_LINK}/uploads/2025/08/10/mylogo-7c0bc3bd.png?cb=1754842683033`;
export const resume = `${CDN_LINK}/uploads/2025/08/12/rohan_kumar_sde_2025-99b12fa8.pdf?cb=1755035421315`;
