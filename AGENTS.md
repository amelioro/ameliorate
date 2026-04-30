# AGENTS: How to be productive here

NOTE: Check `AGENTS.local.md` for personal preferences.

This repo is a Next.js + tRPC + Prisma TypeScript app with a React UI and Zustand state. It runs locally with Dockerized Postgres and a mock Auth0 server; prod is Netlify + Neon.

## Architecture

Next.js serves both UI and API:

- `src/pages/` — Next.js routes (files named `*.page.tsx`)
- `src/web/` — React components organized by feature
- `src/api/routers/` — tRPC routers; `src/api/trpc.ts` initializes tRPC with Sentry middleware
- `src/common/` — shared Zod schemas and TypeScript types (I/O contracts)
- `src/db/` — Prisma schema, migrations, and client extensions

Data flow: UI components use Zustand stores and React Query to call tRPC → Prisma → Postgres. Deeper diagrams in `design-docs/`:

- `design-docs/architecture-by-env.md` — local/preview/prod topology
- `design-docs/data-flow.md` — client → tRPC → Prisma → Postgres
- `design-docs/diagram-rendering.md` — React Flow rendering pipeline
- `design-docs/state-management.md` — Zustand patterns and conventions

### State management

Zustand stores use stacked custom middleware: persist → devtools → zundo (undo/redo) → `apiSyncer`.

- Separate actions from store; only export custom hooks (not the raw store).
- Selectors use `createWithEqualityFn` with shallow/deep equality to avoid unnecessary rerenders.
- `apiSyncer` (`src/web/topic/diagramStore/apiSyncerMiddleware.ts`) diffs node/edge/score state with `microdiff` and calls `trpc.topic.updateDiagram` on every relevant `setState` for non-playground topics.
- Pause syncing during loads: `useTopicStore.apiSyncer.pause()` / `.resume()` (see `src/web/topic/topicStore/store.ts`).

Example store: `src/web/topic/diagramStore/store.ts`.

## Conventions

- **Variable names**: always prefer full names over abbreviations, especially in lambda parameters.
- **Styling**: prefer Tailwind utility classes over Emotion (Emotion is being deprecated).
- **Functional style**: prefer functional-style programming generally; prefer `.forEach` over `.reduce`.
- **Path aliases**: `@/…` → `src/…` (works in both Next.js and Vitest via `vite-tsconfig-paths`).
- **Auth**: Auth0 in hosted envs; `mock-auth` container locally (accepts any credentials; seeded user authId: `oauth-test-user`).
- **Observability**: Sentry wraps all tRPC routes, sets transaction names `trpc/{type}/{path}`.
- **Commit messages**: Conventional Commits enforced by `commitlint.config.mjs`. Valid types: `build`, `chore`, `ci`, `db`, `docs`, `feat`, `fix`, `touchup`, `perf`, `refactor`, `revert`, `style`, `test`.

## Developer workflows

**Setup (Docker required):**

```bash
npm run setup:local   # install deps, seed DB, build mock-auth (one-time)
npm run dev           # start DB + mock-auth + Next.js on localhost
```

**After pulling:**

```bash
npm run update        # run new migrations + install new deps
```

**Quality checks:**

```bash
npm run lint          # ESLint (strict + functional rules)
npm run check-types   # tsc --noEmit
npm run check-pretty  # Prettier check
```

**Tests:**

```bash
npm run test                                               # all Vitest tests
npm run test -- src/api/routers/topic.test.ts             # single file
npm run test -- src/api/routers/topic.test.ts -t "name"   # single test
```

Tests use prismock for DB mocking (auto-reset per test). Setup: `scripts/setupTests.ts`.

**E2E (Playwright in Docker — requires Docker Desktop 4.29+ with host networking):**

```bash
npm run e2e:build && npm run e2e:test:regression
```

**Migrations:**

```bash
npm run migration:generate   # generate up/down SQL from schema diff
npm run migration:run        # apply locally (NEVER reset if there's drift; regenerates client)
npm run migration:deploy     # apply without drift checks (prod)
npm run migration:rollback   # rollback last migration
```

## Integration points

- **tRPC routers**: add procedures in `src/api/routers/*`, reuse Zod schemas from `src/common/*`. See `topic.updateDiagram` for an example handling bulk diffs with auth checks in a single transaction.
- **Frontend state**: update stores under `src/web/**/store.ts`; route DB-persisted changes through the store so `apiSyncer` computes diffs automatically.
- **API for LLMs/automation**: `GET /api/panel` returns router docs. For schema/examples: `GET /api/trpc/topicAI.getPromptData` (see `src/api/README.md`).

## Useful references

- Topic graph helpers: `src/web/topic/utils/*` (e.g., `diagram`, `graph`, filters)
- Diff-to-API conversion example: `src/web/topic/utils/apiConversion.ts`
