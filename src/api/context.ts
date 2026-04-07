import * as Sentry from "@sentry/nextjs";
import { inferAsyncReturnType } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";

import { auth0 } from "@/api/initAuth0";
import { findValidPersonalAccessToken, parseBearerToken } from "@/api/personalAccessTokenAuth";
import { xprisma } from "@/db/extendedPrisma";

/**
 * Authenticates via PAT if there is one, otherwise uses session.
 *
 * Note: we're not falling back from PAT to session authentication if PAT is present yet invalid,
 * mainly to avoid confusion about what is being used.
 */
export const createContext = async ({ req, res }: CreateNextContextOptions) => {
  // If there's a Bearer token, authenticate via PAT
  const bearerToken = parseBearerToken(req.headers.authorization);

  if (bearerToken) {
    const validPersonalAccessToken = await findValidPersonalAccessToken(bearerToken);
    if (validPersonalAccessToken) {
      Sentry.setUser({ username: validPersonalAccessToken.user.username });

      return {
        userAuthId: validPersonalAccessToken.user.authId,
        userEmailVerified: true, // PAT issuance requires a verified email, so this is always true for a valid PAT
        user: validPersonalAccessToken.user,
        authSource: "pat" as const,
      };
    }

    return {};
  }

  // If there's no Bearer token, authenticate via session
  const session = await auth0.getSession(req, res);
  const userAuthId = session?.user.sub as string | null;
  const userEmailVerified = session?.user.email_verified as boolean | null;

  if (!userAuthId) return {};

  const user = await xprisma.user.findFirst({ where: { authId: userAuthId } });

  if (user) Sentry.setUser({ username: user.username });

  return { userAuthId, userEmailVerified, user, authSource: "session" as const };
};

export type Context = inferAsyncReturnType<typeof createContext>;
