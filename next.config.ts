import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['lavish-bucket-vastness.ngrok-free.dev'],
  images: {
    // Next.js optimization enabled — auto WebP, responsive sizes, lazy loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256],
    formats: ['image/webp'],
    minimumCacheTTL: 86400, // Cache optimized images for 24 hours
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.sensual.co.in',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/**/*.wasm', './node_modules/**/*.node']
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/portal_ad',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
