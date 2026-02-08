import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import createBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const disableImageOptimization = process.env.NEXT_DISABLE_IMAGE_OPTIMIZATION === 'true';

const nextConfig: NextConfig = {
  images: {
    unoptimized: disableImageOptimization,
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.rohangautam.dev' },
      { protocol: 'https', hostname: 'pub-92ca52f522664b02af9bc8a7906e3013.r2.dev' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'pelocal.com' },
    ],
  },
  // SECURITY: Add security headers for defense-in-depth
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          // HSTS: Force HTTPS for 1 year, including subdomains
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // CSP: Content Security Policy to prevent XSS
          // Allows Next.js inline scripts, same-origin resources, and trusted CDNs
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com", // Next.js requires unsafe-inline/eval; Cloudflare Turnstile
              "style-src 'self' 'unsafe-inline'", // Next.js requires unsafe-inline for CSS
              "img-src 'self' data: https: blob:", // Allow images from CDNs
              "font-src 'self' data:",
              "connect-src 'self' https://api.rohangautam.dev https://challenges.cloudflare.com https://*.sentry.io", // API + Turnstile + Sentry
              'frame-src https://challenges.cloudflare.com', // Cloudflare Turnstile iframe
              "frame-ancestors 'none'", // Prevent clickjacking
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join('; '),
          },
          // X-Frame-Options: Prevent clickjacking (legacy, CSP frame-ancestors is preferred)
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // X-Content-Type-Options: Prevent MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer-Policy: Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions-Policy: Restrict browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'rohan-kumar-wz',

  project: 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
