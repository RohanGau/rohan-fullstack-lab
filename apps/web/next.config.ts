import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.rohangautam.dev' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
    ],
    domains: ['cdn.discordapp.com', 'pub-92ca52f522664b02af9bc8a7906e3013.r2.dev', 'pelocal.com'],
  },
};

export default nextConfig;
