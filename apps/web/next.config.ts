import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@liminal/convex'],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
