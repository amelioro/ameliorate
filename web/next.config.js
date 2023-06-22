/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    emotion: true,
  },
  pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js"],
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
