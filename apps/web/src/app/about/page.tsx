'use client';

import { AboutSkeleton } from '@/components/about/AboutSkeleton';
import { ErrorMessage } from '@/components/profile/ErrorMessage';
import { withClientFallback } from '@/lib/hoc/withClientFallback';

const AboutContent = withClientFallback(() => import('@/components/about/AboutContent'), {
  fallback: <AboutSkeleton />,
  errorFallback: <ErrorMessage message="Failed to load about page." />,
});

export default function AboutPage() {
  return <AboutContent />;
}
