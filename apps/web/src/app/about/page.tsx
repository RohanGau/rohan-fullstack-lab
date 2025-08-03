'use client';

import { AboutSkeleton } from '@/components/about/AboutSkeleton';
import { withClientFallback } from '@/lib/hoc/withClientFallback';


const AboutContent = withClientFallback(
  () => import('@/components/about/AboutContent'),
  { fallback: <AboutSkeleton />}
);

export default function AboutPage() {
  return <AboutContent />
}
