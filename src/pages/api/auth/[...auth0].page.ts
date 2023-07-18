import { AfterCallback, handleAuth, handleCallback } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";

import { prisma } from "../../../api/prisma";

const afterCallback: AfterCallback = async (_req, res, session, _state) => {
  const userClaims = session.user as UserProfile;
  if (!userClaims.sub) throw new Error("No sub claim in user profile");

  // fetch user from db
  const user = await prisma.user.findUnique({ where: { authId: userClaims.sub } });

  // redirect to /choose-username if user doesn't exist, otherwise redirect to user's page
  res.setHeader("Location", user ? `/${user.username}` : "/choose-username");

  return session;
};

export default handleAuth({
  callback: handleCallback({ afterCallback }),
});
