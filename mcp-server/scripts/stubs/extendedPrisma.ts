// Stub of @/db/extendedPrisma used during codegen via esbuild's --alias flag.
// The codegen never executes a procedure handler, so the real Prisma client
// (and its generated client.ts which uses ESM-only import.meta.url) is never
// needed. Stubbing it here avoids dragging Prisma's runtime into the codegen
// bundle.
export const xprisma: unknown = new Proxy(
  {},
  {
    get(_target, prop) {
      throw new Error(
        `[mcp-server codegen stub] xprisma.${String(prop)} was accessed during codegen — codegen should only inspect schema metadata, not call Prisma.`,
      );
    },
  },
);
