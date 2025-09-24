import "dotenv/config";
import path from "node:path";

import type { PrismaConfig } from "prisma";

export default {
  schema: path.join("src", "db", "schema.prisma"),
  migrations: {
    path: path.join("src", "db", "migrations"),
    seed: "tsx scripts/seed.ts",
  },
} satisfies PrismaConfig;
