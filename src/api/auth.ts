import { TRPCError } from "@trpc/server";

import { middleware } from "./trpc";

// "logged in" implying that the user has a record in our database, as opposed to "authenticated"
// meaning that there's just a record in the auth provider's database.
export const isLoggedIn = middleware(async (opts) => {
  const { ctx } = opts;

  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });

  return opts.next({ ctx: { user: ctx.user } });
});

export const isAuthenticated = middleware(async (opts) => {
  const { ctx } = opts;

  if (!ctx.userAuthId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });

  return opts.next({ ctx: { userAuthId: ctx.userAuthId } });
});

export const isEmailVerified = middleware(async (opts) => {
  const { ctx } = opts;

  if (!ctx.userEmailVerified)
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Email not verified" });

  return opts.next({ ctx: { userEmailVerified: ctx.userEmailVerified } });
});
