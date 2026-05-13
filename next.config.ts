import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true, // Enable gzip compression
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Enable SWC minification (faster builds)
  swcMinify: true,

  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // Enable React strict mode for better error handling
  reactStrictMode: true,

  // Optimize font loading
  optimizeFonts: true,

  // Power pack features for better performance
  experimental: {
    // Enable optimized CSS loading
    optimizeCss: true,
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', 'chart.js', 'react-chartjs-2'],
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
