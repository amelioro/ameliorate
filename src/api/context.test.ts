/* eslint-disable functional/no-let -- let is needed to reuse `before`-initialized variables across tests */
import { NextApiRequest, NextApiResponse } from "next";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { createContext } from "@/api/context";
import { auth0 } from "@/api/initAuth0";
import { generateToken } from "@/api/personalAccessTokenAuth";
import { xprisma } from "@/db/extendedPrisma";
import { User } from "@/db/generated/prisma/client";

import { testEmail } from "../../scripts/setupTests";

let user: User;

beforeEach(async () => {
  user = await xprisma.user.create({
    data: { username: "testuser", authId: "testauth", email: testEmail },
  });
});

const mockRequest = (authorization?: string) => {
  return {
    req: { headers: { authorization } } as unknown as NextApiRequest,
    res: {} as unknown as NextApiResponse,
  };
};

describe("createContext with PAT", () => {
  test("returns authenticated context for valid PAT", async () => {
    const { plaintext, hash } = generateToken();
    await xprisma.personalAccessToken.create({
      data: { ownerUsername: user.username, name: "test", tokenHash: hash },
    });

    const context = await createContext(mockRequest(`Bearer ${plaintext}`));

    expect(context).toEqual({
      userAuthId: user.authId,
      userEmailVerified: true,
      user,
      authSource: "pat",
    });
  });

  test("returns empty context for revoked PAT", async () => {
    const { plaintext, hash } = generateToken();
    await xprisma.personalAccessToken.create({
      data: {
        ownerUsername: user.username,
        name: "revoked-test",
        tokenHash: hash,
        revokedAt: new Date(),
      },
    });

    const context = await createContext(mockRequest(`Bearer ${plaintext}`));

    expect(context).toEqual({});
  });

  test("returns empty context for expired PAT", async () => {
    const { plaintext, hash } = generateToken();
    await xprisma.personalAccessToken.create({
      data: {
        ownerUsername: user.username,
        name: "expired-test",
        tokenHash: hash,
        expiresAt: new Date(Date.now() - 1),
      },
    });

    const context = await createContext(mockRequest(`Bearer ${plaintext}`));

    expect(context).toEqual({});
  });

  test("returns empty context for invalid bearer token", async () => {
    const context = await createContext(mockRequest("Bearer am_pat_nonexistent123"));

    expect(context).toEqual({});
  });

  test("does not fall back to session when bearer token is present but invalid", async () => {
    // mocking `getSession` simulates that we have a "valid" session cookie
    const getSessionSpy = vi.spyOn(auth0, "getSession").mockResolvedValue({
      user: { sub: user.authId, email_verified: true },
    } as Awaited<ReturnType<typeof auth0.getSession>>);

    // show that with a valid session cookie and no Bearer token, we get our user
    const sessionOnlyContext = await createContext(mockRequest());
    expect(sessionOnlyContext).toEqual({
      userAuthId: user.authId,
      userEmailVerified: true,
      user,
      authSource: "session",
    });

    // but with an invalid Bearer token, we don't get our session cookie's user
    const context = await createContext(mockRequest("Bearer am_pat_badtoken"));

    expect(context).toEqual({});
    expect(getSessionSpy).toHaveBeenCalledTimes(1);
  });
});
