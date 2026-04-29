import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { zodToJsonSchema } from "zod-to-json-schema";

// Capture the output path relative to mcp-server's cwd before we chdir below.
const OUTPUT_PATH = resolve(process.cwd(), "src/generated/schemas.json");

// chdir to the main project root because some main-project modules use
// `process.cwd()` at module-load time to read static files (e.g.
// src/api/topicAI.ts reads examples/visible_act.source.txt via
// `path.join(process.cwd(), "examples", ...)`). The codegen runs these
// imports as part of building up procedure metadata, so cwd needs to look
// like the project root for those reads to succeed.
process.chdir(resolve(process.cwd(), ".."));

// The codegen never executes a procedure — it only walks `_def.inputs` to read
// Zod schemas off procedure metadata. But importing _app.ts transitively loads
// modules that read env vars at module-load time and throw if missing
// (Prisma adapter in src/db/basePrisma.ts, Auth0 in src/api/initAuth0.ts).
// We stub them here with dummy values so the imports succeed; the values are
// never used at runtime. This keeps the MCP server's own .env focused on
// MCP-specific config (PAT, base URL) and decoupled from the main project.
/* eslint-disable functional/immutable-data */
process.env.DATABASE_URL ??= "postgresql://stub:stub@localhost:5432/stub";
process.env.AUTH0_BASE_URL ??= "http://stub";
process.env.RESEND_API_KEY ??= "stub";
/* eslint-enable functional/immutable-data */

interface ToolSchema {
  description?: string;
  procedureType: "query" | "mutation";
  inputSchema: unknown;
}

async function main() {
  // Dynamic import so the env stubs above run first regardless of module mode (ESM hoists static imports).
  const { appRouter } = await import("@/api/routers/_app");

  const procedures = appRouter._def.procedures as Record<string, unknown>;

  const out: Record<string, ToolSchema> = Object.fromEntries(
    Object.entries(procedures).map(([path, proc]) => {
      const def = (
        proc as {
          _def: {
            inputs: unknown[];
            meta?: { description?: string };
            query?: boolean;
            mutation?: boolean;
          };
        }
      )._def;

      const inputSchema =
        def.inputs.length > 0
          ? zodToJsonSchema(def.inputs[0] as Parameters<typeof zodToJsonSchema>[0])
          : { type: "object", properties: {} };

      const description = def.meta?.description;
      const procedureType = def.query ? "query" : "mutation";

      const toolSchema: ToolSchema = description
        ? { description, procedureType, inputSchema }
        : { procedureType, inputSchema };

      return [path, toolSchema];
    }),
  );

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(out, null, 2));

  console.error(`Wrote ${Object.keys(out).length} tool schemas to ${OUTPUT_PATH}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
