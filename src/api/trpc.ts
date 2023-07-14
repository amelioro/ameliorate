import { initTRPC } from "@trpc/server";
import superjson from "superjson";

import { Context } from "./context";

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  // so that we can send typed date values over trpc https://trpc.io/docs/server/data-transformers
  transformer: superjson,
});

// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
