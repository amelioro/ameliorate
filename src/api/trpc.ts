import * as Sentry from "@sentry/nextjs";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

import { Context } from "@/api/context";

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  // so that we can send typed date values over trpc https://trpc.io/docs/server/data-transformers
  transformer: superjson,
});

// add sentry logging middleware to all routes, see docs https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/integrations/trpc/
// could make a separate `loggedProcedure` or something, but if it's for all routes, that doesn't seem valuable
const sentryMiddleware = t.middleware(async (opts) => {
  // `trpcMiddleware` sets active span name but not the active transaction name, which is what shows up in most free-version Sentry UIs (namely: performance, trace explorer)
  // some context for this not being default is in https://github.com/getsentry/sentry-javascript/issues/4677
  const activeSpan = Sentry.getActiveSpan();
  if (activeSpan) {
    const transaction = Sentry.getRootSpan(activeSpan);
    transaction.updateName(`trpc/${opts.type}/${opts.path}`);
  }

  return await Sentry.trpcMiddleware({ attachRpcInput: true })(opts);
});

// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure.use(sentryMiddleware);
export const middleware = t.middleware;
export const createCallerFactory = t.createCallerFactory;
