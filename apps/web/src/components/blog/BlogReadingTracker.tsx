'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/components/monitoring/GoogleAnalytics';

interface BlogReadingTrackerProps {
  blogTitle: string;
  blogId: string;
}

/**
 * Blog Reading Progress Tracker
 *
 * Tracks:
 * - Time spent reading
 * - Scroll depth (25%, 50%, 75%, 100%)
 *
 * GA4 Insights:
 * - Which posts keep readers engaged
 * - Average reading time per post
 * - Content completion rate
 * - Drop-off points
 */
export function BlogReadingTracker({ blogTitle, blogId }: BlogReadingTrackerProps) {
  useEffect(() => {
    const startTime = Date.now();
    const scrollMilestones = new Set<number>();

    // Track reading time on unmount
    const trackReadingTime = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Only track if user spent >10 seconds (meaningful engagement)
      if (timeSpent > 10) {
        trackEvent('blog_reading_time', {
          event_category: 'engagement',
          event_label: blogTitle,
          blog_id: blogId,
          value: timeSpent,
        });
      }
    };

    // Track scroll depth
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;

      // Track milestones: 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 100];

      for (const milestone of milestones) {
        if (scrollPercent >= milestone && !scrollMilestones.has(milestone)) {
          scrollMilestones.add(milestone);
          trackEvent('blog_scroll_depth', {
            event_category: 'engagement',
            event_label: blogTitle,
            blog_id: blogId,
            scroll_depth: `${milestone}%`,
          });
        }
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Track on unmount (user leaves page)
    return () => {
      window.removeEventListener('scroll', handleScroll);
      trackReadingTime();
    };
  }, [blogTitle, blogId]);

  // This component renders nothing - it's just for tracking
  return null;
}
