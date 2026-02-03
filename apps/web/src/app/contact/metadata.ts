import type { Metadata } from 'next';
import { siteUrl } from '@/lib/constant';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Rohan Kumar for frontend engineering opportunities, consulting, or collaboration on web development projects.',
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: 'Contact - Rohan Kumar',
    description:
      'Get in touch for frontend engineering opportunities, consulting, or collaboration on web development projects.',
    url: `${siteUrl}/contact`,
    type: 'website',
  },
};
