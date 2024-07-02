import * as Sentry from "@sentry/nextjs";
import { inferAsyncReturnType } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";

import { auth0 } from "@/api/initAuth0";
import { xprisma } from "@/db/extendedPrisma";

export const createContext = async ({ req, res }: CreateNextContextOptions) => {
  const session = await auth0.getSession(req, res);
  const userAuthId = session?.user.sub as string | null;
  const userEmailVerified = session?.user.email_verified as boolean | null;

  if (!userAuthId) return {};

  const user = await xprisma.user.findFirst({ where: { authId: userAuthId } });

  if (user) Sentry.setUser({ username: user.username });

  return { userAuthId, userEmailVerified, user };
};

export type Context = inferAsyncReturnType<typeof createContext>;
