import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    statistics: {
      stale: 60 * 60 * 24 * 1, // 14 days
      revalidate: 60 * 60 * 4, // 1 day
      expire: 60 * 60 * 24 * 12, // 14 days
    },
  },
};

export default nextConfig;
