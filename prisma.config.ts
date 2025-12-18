import "dotenv/config";
import path from "node:path";

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("src", "db", "schema.prisma"),
  migrations: {
    path: path.join("src", "db", "migrations"),
    seed: "tsx scripts/seed.ts",
  },
  datasource: {
    // Generally should not be pooled, because this is used for migrations.
    // See https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7#prisma-schema-changes.
    // Also: using process.env with fallback instead of env() helper so that `prisma generate`
    // works in CI without a real database URL (since it doesn't actually connect to the DB).
    url: process.env.DIRECT_URL ?? "",
  },
});
