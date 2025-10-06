# Requirements Document

## Introduction

Standardize graph edge direction and labeling across the Topic diagram so that all edges point from source to target and labels consistently describe how the source relates to the target. Today, edges always point “upwards” to the source, labels always read target→source, and some relations have duplicate representations (e.g., creates vs createdBy). This refactor removes ambiguity, simplifies UI logic (incoming/outgoing and add flows), improves learnability, and enables future features like configurable vertical orientation without breaking layout.

Key goals:

- Consistent edge direction: source → target, everywhere (storage, API, UI, layout inputs).
- Consistent label semantics: label states how the source relates to the target (active voice or clearly source-referential wording), with a single canonical label per relation.
- Preserve current visual layout: problems remain at the top by default; solutions at the bottom; effects/detriments/benefits maintain their current relative vertical placement.

Out of scope (for now): adding a UI setting to invert vertical orientation (solutions on top); only ensure the new model makes this trivial later.

## Considered Alternatives

- ALT-001: Keep current direction but rename “parent/child” and adjust docs only — rejected because the direction/label mismatch keeps causing developer and user confusion in add flows, “All/Incoming/Outgoing” summaries, and in migration/AI examples; it doesn’t solve duplicate relation names either.
- ALT-002: Support both directions and auto-normalize at boundaries — rejected because having two valid internal representations increases complexity, test surface, and risk of drift; we want one canonical representation end-to-end.
- ALT-003: Change labels only (keep direction) — rejected because the unintuitive “target→source” reading is the root cause of confusion and contradicts common graph conventions and React Flow defaults.
- ALT-004: Redesign layout to be direction-agnostic without any edge flipping — partially viable, but we still need a canonical direction to simplify add flows, filters, AI prompt data, and future features.

## Alignment with Product Vision

This change improves clarity and reduces cognitive overhead in the core diagramming experience, directly supporting the mission to “empower humanity to effectively solve problems by making it trivial to mutually understand the intricacies and perspectives involved.” Consistent direction and labels make relationships immediately legible, reduce misinterpretation, and improve collaboration and future automation (e.g., LLM-generated structures).

## Requirements

Acceptance criteria include both behavioral and migration outcomes. Where “layout unchanged” is specified, vertical ordering should remain the same.

### REQ-001: Canonical edge direction (source → target)

User Story: As a developer, I want edges to be stored and processed as source → target so that direction matches common graph intuition and React Flow conventions.

Acceptance Criteria

1. All edges in persisted storage, APIs (zod schemas), stores, and UI components represent direction as source → target.
2. The edge schema/type description no longer states that the label reads target → source.
3. Downloaded/Uploaded Topic JSON uses source → target consistently.
4. The “Incoming | Outgoing | All” views and filters still use direction that matches source/target without special-casing topic types.

### REQ-002: Canonical relation labels (single, direction-consistent)

User Story: As a developer, I want one canonical label per relation that consistently describes how the source relates to the target, so that add buttons, summaries, and AI exports don’t need to branch by topic type or reverse direction semantics.

Acceptance Criteria

1. Each relation has exactly one allowed label in the canonical set; synonyms or reverse-voice variants are removed.
2. Labels describe source → target semantics. Examples of canonicalization:
   - createdBy → creates (invert direction during migration; keep only creates going forward)
   - Keep source-referential “of/for” labels where they already read source → target (e.g., subproblemOf, obstacleOf, criterionFor, contingencyFor), or replace with active-voice alternatives if product prefers. Final list captured below.
3. The canonical set is updated in `src/common/edge.ts` and used consistently throughout frontend and backend.
4. Add flows and menu copy match the canonical labels and direction.

Canonical Topic relation labels (final):

- causes
- has
- addresses
- accomplishes
- contingencyFor
- criterionFor
- fulfills
- impedes
- mitigates

Migration mapping to canonical labels/directions:

- subproblemOf → has (reverse direction to “X has Y”)
- createdBy → causes (reverse direction to “X causes Y”)
- creates → causes (same direction)
- obstacleOf → impedes (same direction)
- All other existing topic labels already in the canonical set remain unchanged.

Research and justification labels remain as-is (they already read source → target):

- asksAbout, potentialAnswerTo, relevantFor, sourceOf, mentions
- supports, critiques

### REQ-003: Terminology shift away from parent/child in business logic and UI

User Story: As a developer, I want to use “incoming/outgoing” (graph semantics) and “above/below” (layout semantics) instead of overloading parent/child, so that meaning is unambiguous and independent of vertical orientation.

Acceptance Criteria

1. New UI copy and code comments avoid using parent/child and ancestor/descendant. Migrate all usages to graph semantics (incoming/outgoing for 1-hop; upstream/downstream for multi-hop) or layout semantics (above/below) as appropriate.
2. Replace utility functions and identifiers that use parent/child/ancestor/descendant terminology with incoming/outgoing/upstream/downstream or above/below. Do not alias; no shims.
3. Summary tabs/buttons and add menus generally rely on direction (incoming/outgoing) for behavior and copy; additional classifications (e.g., problem-/solution-based) may be applied where useful.

### REQ-004: Preserve current layout visuals by default

User Story: As a user, I want the diagram to look the same after the refactor so that my mental model and screenshots don’t break.

Acceptance Criteria

1. With the same topic, the default vertical ordering (e.g., problems near top, solutions near bottom) remains unchanged within minor curve differences.
2. The layout pipeline may virtually flip edges back to the previous “upward-to-source” orientation solely for ranking/routing if needed, but this is internal to layout; stored and UI-facing edges remain source → target.
3. Effects maintain their current placement relative to problems/solutions. Layout must determine whether an effect is problem-based or solution-based by tracing its incoming edges upstream: if an effect is caused (upstream) by a problem, place it with problems (top); if caused by a solution, place it with solutions (bottom); if both, place it in the middle. The same approach may be applied to related nodes (e.g., benefits/detriments) as appropriate.
4. Future option (not implemented now): a configuration to invert vertical orientation must be feasible without changing edge semantics.

### REQ-005: Data and code migration

User Story: As a developer, I want a reliable migration that updates all existing topics to the new direction/labels without breaking users’ content.

Acceptance Criteria

1. Database/API migration:
   - For every edge, compute new (sourceId, targetId) as the canonical source → target pair.
   - Map deprecated labels to canonical ones:
     - createdBy → creates (and ensure direction is source creates target)
   - Keep other labels but ensure they’re interpreted as source → target going forward.
2. Frontend migration:
   - Update add flows in `src/web/topic/diagramStore` to assume source → target labels.
   - Inventory all usages of parent/child and ancestor/descendant across frontend code; update each reference to the appropriate incoming/outgoing or above/below semantics.
3. Back-compat import:
   - Importers detect old exports (by version or by schema hint) and auto-upgrade to new direction/labels on load.
4. Tests and examples updated: e2e, unit tests, and `examples/` use the new semantics.

### REQ-006: LLM/automation compatibility

User Story: As a developer using Topic AI or external APIs, I want a single direction across examples and schemas so that conversions don’t need special-casing.

Acceptance Criteria

1. `topicAI` prompt data exports edges as source → target and uses canonical labels; justification filtering remains unchanged.
2. API docs at `/api/panel` and any public schema descriptions reflect the new semantics.
3. `examples/` JSON updated to match new direction.

## Non-Functional Requirements

- PER-001: Migration performance — migrating current topics should complete quickly; no special batching or bulk operations are required at this time.
- REL-001: Data integrity — no edge should be lost; idempotent re-run protection (e.g., tagging the migration version) to prevent double-flips.
- USR-001: Learnability — add flows and “Incoming | Outgoing | All” should be self-explanatory post-change without reading docs.
- OBS-001: Observability — Sentry logs for migration runs and any detected anomalies in direction/label pairings.
- COMP-001: Compatibility — old exports can still be imported; they are auto-upgraded in-memory before persistence.

## Related Specifications / Further Reading

- Visuals
  - `.ai/plans/edge-direction-standardization/flipped-renamed-edges.image.png` - image illustrating current state vs goal
- Repo docs
  - `design-docs/diagram-rendering.md` — rendering and layout pipeline
  - `design-docs/data-flow.md` — client → tRPC → Prisma → Postgres
  - `design-docs/vocabulary.md` — shared terms for graph/diagram
  - `src/common/edge.ts` — relation names and schemas (current source of truth)
  - `src/web/topic/utils/graph.ts` and `src/web/topic/utils/node.ts` — neighbors, parents/children utilities
- External
  - React Flow documentation on edge direction conventions (source → target)
