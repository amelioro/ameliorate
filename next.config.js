import bundleAnalzyer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

const withBundleAnalyzer = bundleAnalzyer({
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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        port: "",
        pathname: "/user-attachments/assets/**",
      },
    ],
  },
  pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js"],
  reactStrictMode: true,
  swcMinify: true,
};

// ideally would separately have a sentryConfig but couldn't figure out how to get the `SentryBuildOptions` type
const nextAndSentryConfig = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "amelioro",
  project: "ameliorate",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  // widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  // don't need sourcemaps uploaded to sentry in development; this process takes some time during build, so skip it if unnecessary
  sourcemaps: { disable: process.env.SENTRY_ENVIRONMENT === "development" },

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  // automaticVercelMonitors: true,
});

// eslint-disable-next-line functional/immutable-data
export default withBundleAnalyzer(nextAndSentryConfig);
