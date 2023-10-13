import { PrismockClient } from "prismock";
import { PrismockClientType } from "prismock/build/main/lib/client";
import { afterEach, vi } from "vitest";

import { xprisma } from "../src/db/extendedPrisma";

// this seems to add ~300ms per test file, couldn't find a way to load this once for all tests
vi.mock("@prisma/client", () => ({
  PrismaClient: PrismockClient,
}));

afterEach(() => {
  (xprisma as PrismockClientType).reset();
});
