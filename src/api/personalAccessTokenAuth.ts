import { createHash, randomBytes } from "node:crypto";

import { TOKEN_PREFIX } from "@/common/personalAccessToken";
import { xprisma } from "@/db/extendedPrisma";
import { User } from "@/db/generated/prisma/client";

const LAST_USED_AT_STALENESS_MINUTES = 15;

/**
 * Hash a plaintext token to the hex digest stored in the database.
 */
export const hashToken = (plaintext: string): string => {
  // Any decent hash algorithm seems good enough because PATs themselves already have 256 bits of
  // randomness, which seems sufficiently hard to guess given that all individual checks must go
  // through the API which has some level of slowness and can only handle so many queries.
  return createHash("sha256").update(plaintext).digest("hex");
};

/**
 * Generate a new plaintext PAT and its hash.
 */
export const generateToken = (): { plaintext: string; hash: string } => {
  const randomPart = randomBytes(32).toString("base64url");
  const plaintext = `${TOKEN_PREFIX}${randomPart}`;
  const hash = hashToken(plaintext);

  return { plaintext, hash };
};

export interface PatAuthResult {
  userAuthId: string;
  userEmailVerified: true;
  user: User;
  authSource: "pat";
}

/**
 * Returns personal access token if a valid (non-revoked, non-expired) one exists for the given
 * bearer token, otherwise null.
 *
 * Also updates the token's `lastUsedAt` if the existing value is stale.
 */
export const findValidPersonalAccessToken = async (bearerToken: string) => {
  const hash = hashToken(bearerToken);

  const personalAccessToken = await xprisma.personalAccessToken.findFirst({
    where: {
      tokenHash: hash, // note: no need for constant-time comparison for security because timing attacks are prevented by hashing's avalanche effect
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: { user: true },
  });

  if (!personalAccessToken) return null;

  // try to keep lastUsedAt reasonably up-to-date, but don't block or slow authentication for it
  void updateLastUsedAtIfStale(personalAccessToken.id, personalAccessToken.lastUsedAt).catch(() => {
    // swallow errors because updating lastUsedAt isn't a big deal and shouldn't prevent authentication
  });

  return personalAccessToken;
};

/**
 * Returns the Bearer token if present, otherwise null.
 *
 * Authorization header should look like `Authorization: Bearer <token>` (`authorizationHeader` has
 * the "Authorization" value parsed out already).
 */
export const parseBearerToken = (authorizationHeader: string | undefined): string | null => {
  if (!authorizationHeader) return null;

  const parts = authorizationHeader.trim().split(/\s+/); // trim + `/\s+/` are just slightly more robust than `split(" ")` (e.g. if manually curling and accidentally add a space) for low cost
  if (parts.length !== 2 || parts[0]?.toLowerCase() !== "bearer") return null;

  return parts[1] ?? null;
};

/**
 * Update lastUsedAt only when it is stale (null or older than the staleness threshold).
 */
const updateLastUsedAtIfStale = async (tokenId: number, currentLastUsedAt: Date | null) => {
  const now = new Date();

  const isStale =
    currentLastUsedAt === null ||
    now.getTime() - currentLastUsedAt.getTime() > LAST_USED_AT_STALENESS_MINUTES * 60 * 1000;

  if (!isStale) return;

  await xprisma.personalAccessToken.update({
    where: { id: tokenId },
    data: { lastUsedAt: now },
  });
};
