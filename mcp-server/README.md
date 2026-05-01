# Ameliorate MCP server

An [MCP](https://modelcontextprotocol.io) server that wraps the Ameliorate tRPC API so an LLM agent (e.g. VSCode Copilot, Claude Code) can call its endpoints as native tools, without having to learn cURL request shapes from [src/api/README.md](../src/api/README.md).

This is intended for **local use** — you run it alongside the main Ameliorate dev server and configure your MCP client to launch it.

NOTE: this is mostly vibe-coded and isn't thoroughly reviewed for quality. I realized after-the-fact that I probably could just use a library for this e.g. https://github.com/Jacse/trpc-mcp... but since I've already tested this vibed code, we're sticking with it. We can consider the library approach if we discover any maintenance being annoying.

## Setup

1. `cd mcp-server && npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `AMELIORATE_USERS` — a JSON array of users the LLM can act as. Each entry has `username`, `description`, and `pat` (a Personal Access Token — see "Personal Access Tokens" in [src/api/README.md](../src/api/README.md)). The default template ships with three roles (LLM, source-author, audience) so the LLM can switch identity per call (mainly intended for scoring from multiple perspectives). Every tool call must specify `userToActAs` matching one of the configured usernames.
   - `AMELIORATE_BASE_URL` — optional; defaults to `http://localhost:3000`. Set to `https://ameliorate.app` (or another deployment) to point at a non-local instance.
3. Configure your MCP client to launch this server.
   - **Claude Code**: a project-scoped [.mcp.json](../.mcp.json) is checked in, so the server is auto-registered when you open the repo. You'll be prompted once to approve it.
   - **Other clients**: use the equivalent of `npm start --prefix /absolute/path/to/ameliorate/mcp-server`. For VSCode Copilot, see the checked-in [.vscode/mcp.json](../.vscode/mcp.json).

## Running

`npm start` runs the server. The `prestart` hook regenerates `src/generated/schemas.json` first by introspecting the real `appRouter`, so tool definitions can never go stale relative to the main project.

If startup ever feels slow (right now it seems to be single/double-digit milliseconds), run `npm run codegen` once and remove the `prestart` line from `package.json` locally; this is acceptable because regenerating manually is a small inconvenience for a local-use tool.

## How tool schemas stay in sync with the API

The MCP server reads tool input schemas from `src/generated/schemas.json`, generated at build time by [scripts/generate-schemas.ts](scripts/generate-schemas.ts). The script imports the real `appRouter` from the main project, walks `_def.procedures`, and converts each procedure's Zod input schema to JSON Schema via `zod-to-json-schema`. Tool descriptions come from `proc._def.meta?.description` when present (set via tRPC's `.meta({ description })`).

The codegen runs through esbuild (`esbuild --bundle --format=cjs ...`) rather than directly via `tsx`. This is needed because the main project is configured for ESM (`"type": "module"`), and some of its transitive CJS dependencies use UMD patterns that node's runtime CJS-named-export detection mishandles (e.g. `import { encode } from "he"`). esbuild bundles CJS interop the same way Next.js does, sidestepping the issue without requiring patches in the main project.

We considered three architectural options for this MCP server:

- **Option A — fully decoupled, hand-mirrored schemas in this directory.** Zero coupling to the main project, but schemas would drift silently when the main API changes. Rejected.
- **Option B — codegen of JSON Schemas at build time.** Captures real schemas from the live router, no main-project refactor required, no runtime coupling (the running server only reads the generated JSON, not the main project's source). **Chosen.**
- **Option C — extract every procedure's input schema into a separate module in the main project.** Cleanest runtime story, but requires touching every router file in `src/api/routers/`. Rejected as too invasive.

Because the `prestart` hook regenerates schemas on every server start, drift is automatically corrected on the next launch — so we deliberately don't add a compile-time guard around schema/route shape changes. (If we ever drop the `prestart` hook for performance reasons, this tradeoff should be revisited.)

## Env-var stubs in the codegen script

[scripts/generate-schemas.ts](scripts/generate-schemas.ts) sets dummy values for `DATABASE_URL`, `AUTH0_BASE_URL`, and `RESEND_API_KEY` at the top of the file. See the comment in that file for why — short version: importing the real router transitively loads modules that read these env vars at module-load time, but the codegen never actually executes a procedure, so the dummy values are never used. This keeps the MCP server's own `.env` focused on MCP-specific config and decoupled from the main project's runtime env.
