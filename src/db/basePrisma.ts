import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import ws from "ws";

import { PrismaClient } from "@/db/generated/prisma/client";

// websocket is the default that neon's docs use, that's the main reason we're using it rather than http
// eslint-disable-next-line functional/immutable-data
neonConfig.webSocketConstructor = ws;

const adapter =
  // don't use neon adapter in development https://github.com/prisma/prisma/discussions/21346#discussioncomment-9068554
  process.env.NODE_ENV !== "development"
    ? new PrismaNeon({ connectionString: process.env.DATABASE_URL })
    : new PrismaPg({ connectionString: process.env.DATABASE_URL });

// awkward solution to prevent many connections to the db, specifically as created by nextjs hotreloading
// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter, log: ["query", "info", "warn", "error"] });

if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line functional/immutable-data
  globalForPrisma.prisma = prisma;
}
