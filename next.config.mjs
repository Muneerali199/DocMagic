/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Enable SWC minification
  swcMinify: true,
  // Disable powered by header
  poweredByHeader: false,
  // Enable production browser source maps
  productionBrowserSourceMaps: true,
  // Configure images
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
  },
  // Security headers for API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        has: [
          {
            type: 'header',
            key: 'x-api-key',
            value: '(?<apiKey>.*)',
          },
        ],
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
