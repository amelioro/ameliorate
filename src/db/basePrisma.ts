import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/db/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// awkward solution to prevent many connections to the db, specifically as created by nextjs hotreloading
// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter, log: ["query", "info", "warn", "error"] });

if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line functional/immutable-data
  globalForPrisma.prisma = prisma;
}
