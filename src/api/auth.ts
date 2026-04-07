import { TRPCError } from "@trpc/server";

import { middleware } from "@/api/trpc";

export const isAuthenticated = middleware(async (opts) => {
  const { ctx } = opts;

  if (!ctx.userAuthId) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });

  return opts.next({ ctx: { userAuthId: ctx.userAuthId } });
});

export const isEmailVerified = isAuthenticated.unstable_pipe(async (opts) => {
  const { ctx } = opts;

  if (!ctx.userEmailVerified)
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Email not verified" });

  return opts.next({ ctx: { userEmailVerified: ctx.userEmailVerified } });
});

// "logged in" implying that the user has a record in our database, as opposed to "authenticated"
// meaning that there's just a record in the auth provider's database.
export const isLoggedIn = isEmailVerified.unstable_pipe(async (opts) => {
  const { ctx } = opts;

  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not logged in" });

  return opts.next({ ctx: { user: ctx.user } });
});

/**
 * E.g. PersonalAccessToken-management routes (create, list, revoke) require an interactive browser
 * session so that a compromised PAT cannot be used to mint new PATs.
 */
export const isLoggedInViaSession = isLoggedIn.unstable_pipe(async (opts) => {
  const { ctx } = opts;

  if (ctx.authSource !== "session")
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This operation requires an interactive browser session",
    });

  return opts.next({ ctx: { authSource: ctx.authSource } });
});
