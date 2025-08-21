import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.rohangautam.dev' },
      { protocol: 'https', hostname: 'pub-92ca52f522664b02af9bc8a7906e3013.r2.dev' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
      { protocol: 'https', hostname: 'pelocal.com' },
    ],
  },
};

export default nextConfig;
