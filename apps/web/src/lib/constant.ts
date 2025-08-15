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
export const siteUrl = 'https://rohangautam.dev';

export const logoUrl = "https://pub-92ca52f522664b02af9bc8a7906e3013.r2.dev/uploads/2025/08/10/mylogo-7c0bc3bd.png?cb=1754842683033";
