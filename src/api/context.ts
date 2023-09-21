import { getSession } from "@auth0/nextjs-auth0";
import { inferAsyncReturnType } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";

export const createContext = async ({ req, res }: CreateNextContextOptions) => {
  const session = await getSession(req, res);
  const userAuthId = session?.user.sub as string | null;
  const userEmailVerified = session?.user.email_verified as boolean | null;
  return { userAuthId, userEmailVerified };
};

export type Context = inferAsyncReturnType<typeof createContext>;
