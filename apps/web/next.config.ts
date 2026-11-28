import type { NextConfig } from 'next';
import createBundleAnalyzer from '@next/bundle-analyzer';
import { getSecurityHeaders } from './security-headers.mjs';

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const disableImageOptimization = process.env.NEXT_DISABLE_IMAGE_OPTIMIZATION === 'true';
const isDev = process.env.NODE_ENV !== 'production';

const nextConfig: NextConfig = {
  images: {
    unoptimized: disableImageOptimization,
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.rohangautam.dev' },
      { protocol: 'https', hostname: 'assets-stage.rohangautam.dev' },
      { protocol: 'https', hostname: 'pub-92ca52f522664b02af9bc8a7906e3013.r2.dev' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'pelocal.com' },
    ],
  },
  // SECURITY: Single-source security headers shared with public/_headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: getSecurityHeaders({ isDev }),
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
