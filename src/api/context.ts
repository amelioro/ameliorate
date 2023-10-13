import { getSession } from "@auth0/nextjs-auth0";
import { inferAsyncReturnType } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";

import { xprisma } from "../db/extendedPrisma";

export const createContext = async ({ req, res }: CreateNextContextOptions) => {
  const session = await getSession(req, res);
  const userAuthId = session?.user.sub as string | null;
  const userEmailVerified = session?.user.email_verified as boolean | null;

  if (!userAuthId) return {};

  const user = await xprisma.user.findFirst({ where: { authId: userAuthId } });

  return { userAuthId, userEmailVerified, user };
};

export type Context = inferAsyncReturnType<typeof createContext>;
