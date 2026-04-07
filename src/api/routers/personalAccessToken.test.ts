/* eslint-disable functional/no-let -- let is needed to reuse `before`-initialized variables across tests */
import { beforeEach, describe, expect, test } from "vitest";

import { generateToken, hashToken } from "@/api/personalAccessTokenAuth";
import { createCaller } from "@/api/routers/_app";
import { xprisma } from "@/db/extendedPrisma";
import { User } from "@/db/generated/prisma/client";

import { testEmail } from "../../../scripts/setupTests";

let user: User;
let otherUser: User;

beforeEach(async () => {
  user = await xprisma.user.create({
    data: { username: "testuser", authId: "testauth", email: testEmail },
  });
  otherUser = await xprisma.user.create({
    data: { username: "otheruser", authId: "otherauth", email: testEmail },
  });
});

const sessionContext = (forUser: User) => ({
  userAuthId: forUser.authId,
  userEmailVerified: true as const,
  user: forUser,
  authSource: "session" as const,
});

const patContext = (forUser: User) => ({
  userAuthId: forUser.authId,
  userEmailVerified: true as const,
  user: forUser,
  authSource: "pat" as const,
});

const createPatInDb = async (ownerUsername: string, name: string) => {
  const { plaintext, hash } = generateToken();

  const pat = await xprisma.personalAccessToken.create({
    data: { ownerUsername, name, tokenHash: hash },
  });

  return { ...pat, plaintext };
};

describe("personalAccessToken.list", () => {
  test("returns only the caller's tokens", async () => {
    const { plaintext: _p1, ...token1WithoutPlaintext } = await createPatInDb(
      user.username,
      "token1",
    );
    const { plaintext: _p2, ...token2WithoutPlaintext } = await createPatInDb(
      user.username,
      "token2",
    );
    await createPatInDb(otherUser.username, "other-token");

    const trpc = createCaller(sessionContext(user));
    const tokens = await trpc.personalAccessToken.list();

    expect(tokens).toHaveLength(2);
    // Prismock doesn't support Prisma's global omit, so we can't assert tokenHash is absent here.
    // In production, global omit on PrismaClient ensures tokenHash is excluded from all
    // PersonalAccessToken queries. Consider switching to a mock strategy with better modern Prisma support.
    expect(tokens).toEqual(
      expect.arrayContaining([token1WithoutPlaintext, token2WithoutPlaintext]),
    );
  });

  test("rejects unauthenticated and PAT-authenticated callers", async () => {
    const trpcUnauth = createCaller({});
    const trpcPatAuth = createCaller(patContext(user));

    await expect(async () => await trpcUnauth.personalAccessToken.list()).rejects.toThrow();
    await expect(async () => await trpcPatAuth.personalAccessToken.list()).rejects.toThrow(
      "This operation requires an interactive browser session",
    );
  });
});

describe("personalAccessToken.create", () => {
  test("creates a token and returns its plaintext without storing it", async () => {
    const trpc = createCaller(sessionContext(user));

    const createdPat = await trpc.personalAccessToken.create({ name: "CI runner" });
    const storedPat = await xprisma.personalAccessToken.findFirst({
      where: { id: createdPat.id },
      select: { tokenHash: true },
    });

    expect(createdPat.plaintext).toMatch(/^am_pat_/);
    expect(createdPat.name).toBe("CI runner");
    expect(createdPat.expiresAt).toBeNull();
    expect(createdPat.revokedAt).toBeNull();

    expect(storedPat).not.toBeNull();
    expect(storedPat?.tokenHash).toBe(hashToken(createdPat.plaintext));
    expect(JSON.stringify(storedPat)).not.toContain(createdPat.plaintext);
  });

  test("prevents creating a token with an expiration date not in the future", async () => {
    const trpc = createCaller(sessionContext(user));
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await expect(
      async () => await trpc.personalAccessToken.create({ name: "expired", expiresAt: pastDate }),
    ).rejects.toThrow("Expiration date must be in the future");

    await expect(
      async () =>
        await trpc.personalAccessToken.create({ name: "expired", expiresAt: new Date(Date.now()) }),
    ).rejects.toThrow("Expiration date must be in the future");
  });

  test("rejects unauthenticated and PAT-authenticated callers", async () => {
    const trpcUnauth = createCaller({});
    const trpcPatAuth = createCaller(patContext(user));

    await expect(
      async () => await trpcUnauth.personalAccessToken.create({ name: "sneaky" }),
    ).rejects.toThrow();
    await expect(
      async () => await trpcPatAuth.personalAccessToken.create({ name: "sneaky" }),
    ).rejects.toThrow("This operation requires an interactive browser session");
  });
});

describe("personalAccessToken.revoke", () => {
  test("can revoke your own token, whether or not it is revoked already", async () => {
    const createdPat = await createPatInDb(user.username, "to-revoke");
    const trpc = createCaller(sessionContext(user));

    const revoked = await trpc.personalAccessToken.revoke({ id: createdPat.id });
    expect(revoked.revokedAt).not.toBeNull();

    // re-revoking should not fail
    const revokedAgain = await trpc.personalAccessToken.revoke({ id: createdPat.id });
    expect(revokedAgain.revokedAt).not.toBeNull();
  });

  test("prevents revoking a token that isn't yours", async () => {
    const otherPat = await createPatInDb(otherUser.username, "other");
    const trpc = createCaller(sessionContext(user));

    await expect(
      async () => await trpc.personalAccessToken.revoke({ id: otherPat.id }),
    ).rejects.toThrow("Token not found");
  });

  test("rejects unauthenticated and PAT-authenticated callers", async () => {
    const createdPat = await createPatInDb(user.username, "test");

    const trpcUnauth = createCaller({});
    const trpcPatAuth = createCaller(patContext(user));

    await expect(
      async () => await trpcUnauth.personalAccessToken.revoke({ id: createdPat.id }),
    ).rejects.toThrow();
    await expect(
      async () => await trpcPatAuth.personalAccessToken.revoke({ id: createdPat.id }),
    ).rejects.toThrow("This operation requires an interactive browser session");
  });
});

describe("PAT authentication on protected endpoints", () => {
  test("valid PAT can call protected endpoints requiring isLoggedIn", async () => {
    // Separate `api/context.test.ts` verifies that context is set up properly when PAT is provided via bearer token
    const trpc = createCaller(patContext(user));

    const result = await trpc.watch.find({ topicId: 1 });
    expect(result).toBeNull();
  });
});
