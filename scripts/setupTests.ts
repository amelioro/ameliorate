import { type PrismockClientType } from "@pkgverse/prismock/v7";
import * as matchers from "jest-extended";
import { afterEach, expect, vi } from "vitest";

import { xprisma } from "../src/db/extendedPrisma";

import { type PrismaClient } from "@/db/generated/prisma/client";


// add more matchers, e.g. `toIncludeSameMembers` for array comparison without order
// set up by following https://jest-extended.jestcommunity.dev/docs/getting-started/setup#use-with-vitest
expect.extend(matchers);

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

// Started using this fork of prismock instead of OG prismock https://github.com/JQuezada0/prismock
// because prismock wasn't updated for prisma v6.16 or v7.
// Unfortunately the fork isn't popular so could be a security issue (I at least tried glancing
// over the code and having an LLM review it...). But since it's at least slightly maintained,
// and the mocking isn't as hacky as the non-prisma-v7-supporting OG prismock, it seems slightly
// better.
vi.mock("@/db/generated/prisma/client", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/db/generated/prisma/client")>();
  const { getClientClass } =
    await vi.importActual<typeof import("@pkgverse/prismock/v7")>("@pkgverse/prismock/v7");

  return {
    ...original,
    PrismaClient: await getClientClass({
      PrismaClient: original.PrismaClient,
      schemaPath: "./src/db/schema.prisma",
    }),
  };
});

afterEach(async () => {
  await (xprisma as PrismockClientType<PrismaClient>).reset();
});
