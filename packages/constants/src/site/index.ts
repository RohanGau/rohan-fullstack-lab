export const SITE_URL = 'https://rohangautam.dev';

export const AUTHOR_PROFILE = Object.freeze({
  NAME: 'Rohan Kumar',
  TITLE: 'Senior Frontend Engineer',
  EMAIL: 'rohangautam105@gmail.com',
  SECURITY_EMAIL: 'security@rohangautam.dev',
  GITHUB_URL: 'https://github.com/RohanGau',
  LINKEDIN_URL: 'https://www.linkedin.com/in/rohan-gautam',
  TELEGRAM_URL: 'https://t.me/animalpark105',
  DISCORD_URL: 'https://discordapp.com/users/rohangautam105',
} as const);

export const WEB_ROUTES = Object.freeze({
  HOME: '/',
  BLOG: '/blog',
  PROJECT: '/project',
  ABOUT: '/about',
  CONTACT: '/contact',
  RSS: '/rss.xml',
  SITEMAP: '/sitemap.xml',
  LLMS_TXT: '/llms.txt',
} as const);

export const PRIMARY_NAV_ITEMS = Object.freeze([
  { label: 'Home', href: WEB_ROUTES.HOME },
  { label: 'Blog', href: WEB_ROUTES.BLOG },
  { label: 'Project', href: WEB_ROUTES.PROJECT },
  { label: 'About', href: WEB_ROUTES.ABOUT },
] as const);
