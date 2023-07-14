const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    emotion: true,
  },
  env: {
    AUTH0_BASE_URL: process.env.DEPLOY_PRIME_URL || process.env.AUTH0_BASE_URL,
  },
  pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js"],
  reactStrictMode: true,
  swcMinify: true,
};

// eslint-disable-next-line functional/immutable-data
module.exports = withBundleAnalyzer(nextConfig);
