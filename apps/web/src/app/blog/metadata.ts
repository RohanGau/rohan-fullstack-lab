import type { Metadata } from 'next';
import { siteUrl } from '@/lib/constant';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Technical articles on frontend development, React, Next.js, TypeScript, system design, and software architecture by Rohan Kumar.',
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  openGraph: {
    title: 'Blog - Rohan Kumar',
    description:
      'Technical articles on frontend development, React, Next.js, TypeScript, system design, and software architecture.',
    url: `${siteUrl}/blog`,
    type: 'website',
  },
};
