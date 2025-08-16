/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization for CDN
  images: {
    domains: ['github-readme-stats.vercel.app', 'leetcard.jacoblin.cool'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable modern image formats
    formats: ['image/webp', 'image/avif'],
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Static optimization
  trailingSlash: false,
  
  // Enable experimental features for better CDN performance
  experimental: {
    optimizeCss: true,
  },

  // Headers for better CDN caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1, stale-while-revalidate=59',
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
    ];
  },
}

module.exports = nextConfig

