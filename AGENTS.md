# AGENTS: How to be productive here

This repo is a Next.js + tRPC + Prisma TypeScript app with a React UI and Zustand state. It runs locally with Dockerized Postgres and a mock Auth0 server; prod is Netlify + Neon.

## Architecture (big picture)

- Next.js serves both UI and API. UI page routes live under `src/pages`, referencing component code in `src/web`. API routers under `src/api/routers`. Core shared types live in `src/common` and DB access in `src/db`.
- Data flow: UI components use Zustand stores and React Query to call tRPC. See diagrams in `design-docs/`:
  - Architecture by env: `design-docs/architecture-by-env.md`
  - Data flow: `design-docs/data-flow.md` (client → tRPC → Prisma → Postgres)
  - Diagram rendering pipeline: `design-docs/diagram-rendering.md`
- tRPC is initialized in `src/api/trpc.ts` with Sentry middleware. Example router: `src/api/routers/topic.ts` (CRUD + `updateDiagram`).
- State: Zustand stores with custom middleware: persist + devtools + zundo (undo/redo) + app-specific `apiSyncer` to diff-and-sync to server.
  - Example store: `src/web/topic/diagramStore/store.ts`
  - API sync middleware: `src/web/topic/diagramStore/apiSyncerMiddleware.ts` (uses `microdiff`, calls `topic.updateDiagram`).
  - Topic meta store: `src/web/topic/topicStore/store.ts` (notice `apiSyncer.pause()/resume()` during loads).

## Conventions and patterns

- Zustand pattern: separate actions from store, only export custom hooks (see `design-docs/state-management.md`). Selectors often use `createWithEqualityFn` and shallow/deep equality to avoid rerenders.
- Server sync: any `setState` on a non-playground topic will trigger `apiSyncer` to compute CRUD diffs for nodes/edges/scores and call `trpc.topic.updateDiagram`. Pause sync (e.g. when switching topics) via `useTopicStore.apiSyncer.pause()`.
- Types: Zod schemas in `src/common/*` enforce I/O contracts.
- Prefer Tailwind utility classes over styling with Emotion.
- Paths: TS path aliases with `@/…` are enabled (Vitest uses `vite-tsconfig-paths`).
- Auth: Auth0 in hosted envs; local uses `mock-auth` (accepts any username/password; use seeded user authId like `oauth-test-user`).
- Observability: Sentry wraps all tRPC routes (`src/api/trpc.ts`), sets transaction names `trpc/{type}/{path}`.
- Commit messages follow Conventional Commits enforced by `commitlint.config.cjs`.

## Developer workflows

- Setup and run locally (Docker required):
  - `npm run setup:local` (installs deps, seeds DB, builds mock-auth)
  - `npm run dev` (starts DB, mock-auth, Next.js on localhost)
- Update after pulling: `npm run update` (migrations + new deps)
- Tests: `npm run test` (Vitest; configured in `vitest.config.ts` using `scripts/setupTests.ts`)
- Lint/typecheck: `npm run lint`, `npm run check-types` (strict ESLint incl. functional rules)
- E2E (Playwright in container): `npm run e2e:build` then `npm run e2e:test:regression` (requires Docker Desktop 4.29+ with host networking; see `e2e/README` scripts in `e2e/`)
- Prisma/migrations:
  - Generate up/down from schema: `npm run migration:generate`
  - Apply latest locally: `npm run migration:run` (regenerates client; may prompt to reset if drift)
  - Deploy (no drift checks): `npm run migration:deploy`; rollback last: `npm run migration:rollback`

## Integration points

- tRPC routers: add procedures in `src/api/routers/*`, reuse Zod schemas from `src/common/*`. Example `topic.updateDiagram` handles bulk diffs with auth checks and a single transaction.
- Frontend state: update stores under `src/web/**/store.ts`; if persisting to DB, route changes through the store so `apiSyncer` can compute diffs.
- API for LLMs/automation: hit `GET /api/panel` for router docs. For schema/examples, `GET /api/trpc/topicAI.getPromptData` (see `src/api/README.md`).

## Useful references

- High-level docs/diagrams: `design-docs/*`
- Topic graph helpers: `src/web/topic/utils/*` (e.g., `diagram`, `graph`, filters)
- Example diff-to-API conversion: `src/web/topic/utils/apiConversion.ts`

If anything above is unclear or you need more examples (e.g., where React Query hooks are composed, or how views/filters interact), tell me which part to expand and I’ll tighten this doc.
