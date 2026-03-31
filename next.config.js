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
  experimental: {
    // Reduces barrel-import overhead for these packages. Measured ~-7% webpack modules
    // (5,376 → 5,005) for the playground page. Only affects webpack (i.e. production builds);
    // Turbopack (used in local dev via `next dev --turbo`) ignores this option in Next.js 14.2.
    // Note: this config will be a no-op after upgrading to Next.js 15+, which uses Turbopack
    // for both dev and prod, but leaving it here for webpack builds until we make that change.
    optimizePackageImports: [
      "@mui/icons-material",
      "@mui/material",
      "@mui/lab",
      "es-toolkit",
      "es-toolkit/compat",
    ],
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

/**
 * Turn off sentry in development since it's usually not needed, and can slow down builds a few seconds.
 *
 * TODO?: ideally would separately have a sentryConfig but couldn't figure out how to get the `SentryBuildOptions` type
 *
 * Note: there's also a warning when we run `next dev --turbo`, saying that webpack is configured,
 * because `withSentryConfig` and `@next/bundle-analyzer` both add webpack hooks. That is expected
 * for now: this app is on `next@14.2.35`, where Turbopack is only used for local dev,
 * while `next build` still uses webpack. So the warning is dev-only and is not
 * affecting production builds. To remove it cleanly, we would need to move to a
 * Turbopack-compatible stack (`next@15.4.1+`, `@sentry/nextjs@10.13.0+`) and
 * replace webpack-only `@next/bundle-analyzer` with Turbopack's analyzer.
 */
const nextAndSentryConfig =
  process.env.SENTRY_ENVIRONMENT === "development"
    ? nextConfig
    : withSentryConfig(nextConfig, {
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

export default withBundleAnalyzer(nextAndSentryConfig);
