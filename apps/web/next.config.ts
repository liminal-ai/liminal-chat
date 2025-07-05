import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@liminal-api/convex'],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
