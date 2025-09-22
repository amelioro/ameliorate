import { type DMMF } from "@prisma/client/runtime/client";
import { getDMMF } from "@prisma/internals";
import * as matchers from "jest-extended";
import { type PrismockClientType, createPrismock } from "prismock/build/main/lib/client";
import { afterEach, expect, vi } from "vitest";

import { type PrismaClient } from "@/db/generated/prisma/client";

import { xprisma } from "../src/db/extendedPrisma";

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

// this seems to add ~300ms per test file, couldn't find a way to load this once for all tests
vi.mock("@/db/generated/prisma/client", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/db/generated/prisma/client")>();
  const { Prisma } = original;

  // After upgrading from prisma 5.15.1 -> 6.16.2, and generating /prisma/client via the rust-free
  // engine and prisma-client (rather than prisma-client-js), `Prisma` no longer has `dmmf` on it.
  // Apparently `getDMMF()` is more stable for public usage, so we're using that here. https://www.answeroverflow.com/m/1366812800663420978
  // Note: after upgrading, with prisma-client-js there _is_ `Prisma.dmmf`, but it doesn't have all
  // the fields that are expected by its TS type, so that doesn't work either.
  const dmmf = await getDMMF({ datamodelPath: "./src/db/schema.prisma" });
  const PrismaWithDMMF = { ...Prisma, dmmf };

  return {
    // ensure other parts of the import are still usable e.g. `Prisma`
    ...original,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    PrismaClient: createPrismock(
      PrismaWithDMMF as unknown as typeof Prisma & { dmmf: DMMF.Document },
    ),
  };
});

afterEach(() => {
  (xprisma as PrismockClientType<PrismaClient>).reset();
});
