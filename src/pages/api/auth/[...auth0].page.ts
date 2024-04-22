import { AfterCallback } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";

import { auth0 } from "../../../api/initAuth0";
import { xprisma } from "../../../db/extendedPrisma";

const afterCallback: AfterCallback = async (_req, res, session, state) => {
  const userClaims = session.user as UserProfile;
  if (!userClaims.sub) throw new Error("No sub claim in user profile");

  // fetch user from db
  const user = await xprisma.user.findUnique({ where: { authId: userClaims.sub } });

  const returnTo = state?.returnTo as string | undefined;

  // redirect to /choose-username if user doesn't exist, otherwise let `returnTo` return to the page the user was last on
  // default to user's profile page
  const path = user
    ? returnTo
      ? new URL(returnTo).pathname
      : `/${user.username}`
    : "/choose-username";

  // Add any param to location so that netlify doesn't carry forward callback params with our redirect. See https://github.com/auth0/nextjs-auth0/issues/747#issuecomment-1183733931
  // There should be an easier way to just remove the ?code and ?state params from oauth, but this works for now.
  const params = user
    ? returnTo
      ? new URL(returnTo).search || "?login-success"
      : "?login-success"
    : "?login-success";

  const location = `${path}${params}`;
  res.setHeader("Location", location);

  return session;
};

export default auth0.handleAuth({
  callback: auth0.handleCallback({ afterCallback }),
  "refresh-profile": auth0.handleProfile({ refetch: true }),
});
