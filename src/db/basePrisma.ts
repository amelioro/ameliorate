import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import ws from "ws";
import "dotenv/config";

import { PrismaClient } from "@/db/generated/prisma/client";

// websocket is the default that neon's docs use, that's the main reason we're using it rather than http
// eslint-disable-next-line functional/immutable-data
neonConfig.webSocketConstructor = ws;

// DATABASE_URL should generally be pooled, otherwise I guess serverless functions will result in many connections.
// Prisma docs: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer
// Neon docs: https://neon.tech/docs/guides/prisma
const dbUrl = process.env.DATABASE_URL ?? "";

const adapter =
  // don't use neon adapter in development https://github.com/prisma/prisma/discussions/21346#discussioncomment-9068554
  dbUrl.includes("localhost")
    ? new PrismaPg({ connectionString: dbUrl })
    : new PrismaNeon({ connectionString: dbUrl });

// awkward solution to prevent many connections to the db, specifically as created by nextjs hotreloading
// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter, log: ["query", "info", "warn", "error"] });

if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line functional/immutable-data
  globalForPrisma.prisma = prisma;
}
