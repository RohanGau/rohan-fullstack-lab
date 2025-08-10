export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rohan-backend-api.fly.dev';
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
