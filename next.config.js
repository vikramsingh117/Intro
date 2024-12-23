/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
module.exports = {
  images: {
    domains: ['github-readme-stats.vercel.app', 'leetcard.jacoblin.cool'],
    dangerouslyAllowSVG: true,  // Enable SVG images
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",  // Optional: additional security
  },
};

