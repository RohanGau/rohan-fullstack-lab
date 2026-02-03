import type { Metadata } from 'next';
import { siteUrl } from '@/lib/constant';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about Rohan Kumar - Senior Software Engineer specializing in frontend architecture, React, Next.js, and building scalable design systems.',
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: 'About - Rohan Kumar',
    description:
      'Senior Software Engineer with expertise in frontend architecture, performance optimization, and leading high-impact engineering teams.',
    url: `${siteUrl}/about`,
    type: 'profile',
  },
};
