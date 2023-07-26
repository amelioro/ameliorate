import { TRPCError } from "@trpc/server";

import { prisma } from "../db/prisma";
import { middleware } from "./trpc";

// "logged in" implying that the user has a record in our database, as opposed to "authenticated"
// meaning that there's just a record in the auth provider's database.
export const isLoggedIn = middleware(async (opts) => {
  const { ctx } = opts;

  const user = await prisma.user.findFirst({ where: { authId: ctx.userAuthId } });
  if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

  return opts.next({
    ctx: {
      user,
    },
  });
});

export const isAuthenticated = middleware(async (opts) => {
  const { ctx } = opts;

  if (!ctx.userAuthId) throw new TRPCError({ code: "UNAUTHORIZED" });

  return opts.next();
});
