import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.',
      },
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev', 
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
