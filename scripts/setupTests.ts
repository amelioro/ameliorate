import fs from "node:fs";

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

/**
 * Patches Node's require to redirect @prisma/client/runtime/library to client.
 *
 * This is AI-generated, looks fine enough though.
 *
 * Prisma 7 renamed the runtime path from "library" to "client".
 * prismock still imports from the old path, so we patch Node's require
 * to redirect those imports to the new path.
 * See https://github.com/morintd/prismock/issues/1284
 *
 * This uses vi.hoisted to ensure the patch runs before any imports.
 */
/* eslint-disable -- this is a hack, let's not bother with making it clean */
vi.hoisted(() => {
  const NodeModule = require("node:module") as typeof import("node:module");
  const nodePath = require("node:path") as typeof import("node:path");

  const originalRequire = NodeModule.prototype.require;

  NodeModule.prototype.require = function patchedRequire(
    this: NodeJS.Module,
    id: string,
  ): NodeJS.Module {
    if (id === "@prisma/client/runtime/library") {
      const redirectPath = nodePath.resolve(
        process.cwd(),
        "node_modules/@prisma/client/runtime/client.js",
      );
      return originalRequire.call(this, redirectPath);
    }
    return originalRequire.call(this, id);
  } as NodeJS.Require;
});
/* eslint-enable */

vi.mock("@/db/generated/prisma/client", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/db/generated/prisma/client")>();
  const { Prisma } = original;

  // After upgrading from prisma 5.15.1 -> 6.16.2, and generating /prisma/client via the rust-free
  // engine and prisma-client (rather than prisma-client-js), `Prisma` no longer has `dmmf` on it.
  // Apparently `getDMMF()` is more stable for public usage, so we're using that here. https://www.answeroverflow.com/m/1366812800663420978
  // Note: after upgrading, with prisma-client-js there _is_ `Prisma.dmmf`, but it doesn't have all
  // the fields that are expected by its TS type, so that doesn't work either.
  // ---
  // Prisma 7 changed the API from `datamodelPath` to `datamodel` which takes the schema content, so
  // we have to read the file ourselves now.
  // Open prismock issue: https://github.com/morintd/prismock/issues/1482
  const schemaContent = fs.readFileSync("./src/db/schema.prisma", "utf-8");
  const dmmf = await getDMMF({ datamodel: schemaContent });
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
