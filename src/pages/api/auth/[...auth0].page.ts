import { AfterCallback, handleAuth, handleCallback, handleProfile } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";

import { xprisma } from "../../../db/extendedPrisma";

const afterCallback: AfterCallback = async (_req, res, session, _state) => {
  const userClaims = session.user as UserProfile;
  if (!userClaims.sub) throw new Error("No sub claim in user profile");

  // fetch user from db
  const user = await xprisma.user.findUnique({ where: { authId: userClaims.sub } });

  // Add any param to location so that netlify doesn't carry forward callback params with our redirect. See https://github.com/auth0/nextjs-auth0/issues/747#issuecomment-1183733931
  // There should be an easier way to just remove the ?code and ?state params from oauth, but this works for now.
  const params = "?login-success";

  // redirect to /choose-username if user doesn't exist, otherwise let `returnTo` return to the page the user was last on
  if (!user) {
    const location = "/choose-username";
    // causes server-client mismatch because this callback only runs on client, and `Login` button is rendered serverside-first
    // seems ok.
    res.setHeader("Location", `${location}${params}`);
  }

  return session;
};

export default handleAuth({
  callback: handleCallback({ afterCallback }),
  "refresh-profile": handleProfile({ refetch: true }),
});
