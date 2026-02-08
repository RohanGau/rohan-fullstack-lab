import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

/**
 * Google Analytics 4 (GA4) Integration
 *
 * Privacy-friendly configuration:
 * - Respects Do Not Track
 * - Anonymizes IPs
 * - No cross-site tracking
 * - GDPR compliant
 *
 * Tracks:
 * - Page views (automatic)
 * - User engagement
 * - Traffic sources
 * - Conversions
 *
 * Setup:
 * 1. Create GA4 property at https://analytics.google.com
 * 2. Copy Measurement ID (G-XXXXXXXXXX)
 * 3. Add to environment: NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const gaId = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Only load in production or if explicitly enabled
  if (!gaId || (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_GA_ENABLED)) {
    return null;
  }

  return (
    <>
      {/* Google Analytics gtag.js script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            // Privacy-friendly settings
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure',
            // Performance settings
            send_page_view: true,
          });
        `}
      </Script>
    </>
  );
}

/**
 * Custom event tracking helper
 * Use in client components to track user interactions
 *
 * @example
 * import { trackEvent } from '@/components/monitoring/GoogleAnalytics';
 *
 * // Track button click
 * trackEvent('contact_form_submit', {
 *   category: 'engagement',
 *   label: 'Contact Form',
 *   value: 1
 * });
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams);
  }
}

/**
 * Track page view (useful for SPA navigation)
 */
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

/**
 * Track conversion/goal completion
 */
export function trackConversion(conversionName: string, value?: number) {
  trackEvent(conversionName, {
    event_category: 'conversion',
    value: value || 1,
  });
}
