import type { Metadata } from 'next';
import { siteUrl } from '@/lib/constant';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Featured projects and case studies by Rohan Kumar - showcasing frontend architecture, full-stack development, and scalable web applications.',
  alternates: {
    canonical: `${siteUrl}/project`,
  },
  openGraph: {
    title: 'Projects - Rohan Kumar',
    description:
      'Featured projects and case studies showcasing frontend architecture, full-stack development, and scalable web applications.',
    url: `${siteUrl}/project`,
    type: 'website',
  },
};
