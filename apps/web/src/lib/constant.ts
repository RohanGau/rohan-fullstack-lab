export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const CDN_LINK = process.env.NEXT_PUBLIC_CDN_URL;
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string;

export const API = {
  PROFILE: '/api/profiles',
  PROJECTS: '/api/projects',
  BLOGS: '/api/blogs',
  CONTACT: '/api/contact',
};

export const CONTACTS = {
  gmail: 'rohangautam105@gmail.com',
  telegramUrl: 'https://t.me/animalpark105',
  discordUrl: 'https://discordapp.com/users/rohangautam105',
};

export const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'Project', href: '/project' },
  { label: 'About', href: '/about' },
];

export const revalidate = 3600;
export const siteUrl = 'https://rohangautam.dev';

export const logoUrl = `${CDN_LINK}/uploads/2025/08/10/mylogo-7c0bc3bd.png?cb=1754842683033`;
export const resume = `${CDN_LINK}/uploads/2025/08/12/rohan_kumar_sde_2025-99b12fa8.pdf?cb=1755035421315`;
