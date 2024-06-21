import { PrismockClient } from "prismock";
import { PrismockClientType } from "prismock/build/main/lib/client";
import { afterEach, vi } from "vitest";

import { xprisma } from "../src/db/extendedPrisma";

// for some reason I had a really tough time trying to get vitest to load vars from `.env.test`, so we're just setting them here instead
/* eslint-disable functional/immutable-data */
process.env = {
  NODE_ENV: "test",
};
process.env.BASE_URL = "http://localhost:3000"; // not sure how to reuse next.config.js `env` setup
/* eslint-enable functional/immutable-data */

/**
 * `.test` is a reserved top-level domain, so emails in that domain are guaranteed not to be real https://en.wikipedia.org/wiki/Top-level_domain#Reserved_domains
 *
 * Seems slightly awkward for test files to have to include `script/setupTests.ts` for this, but this is easy right now.
 * Maybe something like a `test/setupTests.ts` would be slightly better?
 */
export const testEmail = "test@test.test";

// this seems to add ~300ms per test file, couldn't find a way to load this once for all tests
vi.mock("@prisma/client", () => ({
  PrismaClient: PrismockClient,
}));

afterEach(() => {
  (xprisma as PrismockClientType).reset();
});
