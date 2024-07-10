import * as Sentry from "@sentry/nextjs";

export function register() {
  // `Sentry.init` docs around here https://docs.sentry.io/platforms/javascript/guides/nextjs/
  // The config here will be used whenever the server handles a request.
  // Sentry config is directly in this file instead of previously-suggested `sentry.[runtime].config.ts` because of https://github.com/getsentry/sentry-javascript/issues/12044#issuecomment-2112697663
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: "https://8e46da4107214efd1ec756ec89d406bf@o4507510480764928.ingest.us.sentry.io/4507510485876736",

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,

      // development has a lot of noise, don't really care that much here
      enabled: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT !== "development",

      // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
      // spotlight: process.env.NODE_ENV === 'development',

      integrations: [Sentry.prismaIntegration()],
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: "https://8e46da4107214efd1ec756ec89d406bf@o4507510480764928.ingest.us.sentry.io/4507510485876736",

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,

      // development has a lot of noise, don't really care that much here
      enabled: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT !== "development",
    });
  }
}
