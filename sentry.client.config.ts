// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://8e46da4107214efd1ec756ec89d406bf@o4507510480764928.ingest.us.sentry.io/4507510485876736",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // development has a lot of noise, don't really care that much here
  enabled: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT !== "development",

  // for some reason netlify sentry plugin doesn't do this as it says it does https://github.com/getsentry/sentry-netlify-build-plugin?tab=readme-ov-file#options
  // so we need to set sentry's environment manually
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,

  beforeSendTransaction: (event, _hint) => {
    // replace slugs for pageload/navigation transactions, so they show as e.g. "/examples/test" instead of "/[username]/[topicTitle]"
    // some context for this not being default is in https://github.com/getsentry/sentry-javascript/issues/4677
    if (event.contexts?.trace?.op === "pageload" || event.contexts?.trace?.op === "navigation") {
      return { ...event, transaction: window.location.pathname };
    }
    return event;
  },

  // Replays seem like they could be useful, so we'll just keep them enabled until we know that we'll exceed the free tier
  replaysOnErrorSampleRate: 1.0,
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
