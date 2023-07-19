const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// deploy preview is different because the URL is different for each PR
const baseUrl = process.env.AUTH0_BASE_URL
  ? process.env.AUTH0_BASE_URL
  : process.env.DEPLOY_PRIME_URL ?? "http://localhost:3000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    emotion: true,
  },
  env: {
    AUTH0_BASE_URL: baseUrl,
    BASE_URL: baseUrl,
  },
  pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js"],
  reactStrictMode: true,
  swcMinify: true,
};

// eslint-disable-next-line functional/immutable-data
module.exports = withBundleAnalyzer(nextConfig);
