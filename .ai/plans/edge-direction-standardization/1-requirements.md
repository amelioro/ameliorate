# Requirements Document

## Introduction

Current topic graph edges exhibit inconsistent directionality and labeling:

- Many edges point target → source (visually upward) contradicting semantic expectations of source → target.
- Relation labels mix opposing grammatical perspectives (e.g. `creates` vs `createdBy`).
- Multiple labels describe the same conceptual relation (`creates`, `createdBy`, `causes`).
- Terminology such as "parent/child" is overloaded and only contextually meaningful, increasing cognitive load for users and traversal/layout code.

This feature standardizes all topic-level edge directions to flow source → target with a single canonical label per relation concept, removes legacy reverse-form labels, and refactors terminology (parent/child → outgoing/incoming or above/below; ancestor/descendant → upstream/downstream) for clarity. Layout behavior (vertical ordering of node partitions) must remain visually unchanged except that arrowheads will now point in the new canonical direction. A one-time irreversible data migration will update persisted edges and associated JSON imports.

## Considered Alternatives

- **ALT-001**: Update only labels while retaining mixed directions – rejected because traversal complexity and mental model confusion would persist.
- **ALT-002**: Rewrite layout to operate directly on new semantics without temporary edge flipping – rejected short-term to minimize regression risk; virtual flipping of specific effect-related edges isolates change and preserves existing layout guarantees.

## Alignment with Product Vision

Consistent, intuitive graph semantics reduce friction in understanding complex problem/solution structures, directly supporting the mission to make mutual understanding of intricacies trivial. Standardized direction and labeling simplify user reasoning (cleaner edge vocabulary) and developer tooling (simpler traversal and future analytics), enabling clearer collaborative problem decomposition.

## Requirements

### REQ-001 Canonical Edge Direction & Labels

**User Story:** As a topic editor, I want all edges to read naturally from cause/source to effect/target so that diagrams are quicker to interpret and author.

#### Acceptance Criteria

1. **CRI-001**: All topic edges in persisted data after migration have sourceId → targetId following the new canonical semantics (no remaining inverted legacy edges).
2. **CRI-002**: Legacy labels (`subproblemOf`, `createdBy`, `creates`, `obstacleOf`) are fully replaced per mapping (see REQ-002) with no occurrences in runtime graph state, API responses, or new exports.
3. **CRI-003**: Arrowheads in the diagram visually point from semantic source to semantic target for all canonical relation types.
4. **CRI-004**: No duplicated conceptual relation labels remain (each relation concept has exactly one label).
5. **CRI-005**: Research / justification labels (`asksAbout`, `potentialAnswerTo`, `relevantFor`, `sourceOf`, `mentions`, `supports`, `critiques`) remain unchanged and conform to source → target semantics.

### REQ-002 Relation Vocabulary Normalization

**User Story:** As a contributor, I want a single canonical relation label set so that I can confidently reuse and query relations without guesswork.

#### Acceptance Criteria

1. **CRI-006**: Final canonical set for topic relations is: `causes`, `has`, `addresses`, `accomplishes`, `contingencyFor`, `criterionFor`, `fulfills`, `impedes`, `mitigates` plus research labels enumerated in CRI-005.
2. **CRI-007**: Migration mapping is implemented: `subproblemOf` → `has` (direction reversed to “X has Y”); `createdBy` → `causes` (reversed); `creates` → `causes` (same direction); `obstacleOf` → `impedes` (same direction).
3. **CRI-008**: Any attempt to create an edge with a deprecated label is rejected at validation with a clear error message referencing the canonical replacement.
4. **CRI-009**: API documentation/panel endpoint reflects only canonical labels post-migration.

### REQ-003 Terminology Refactor

**User Story:** As a developer, I want traversal and layout code to use directionally consistent neutral terms so that maintenance and feature additions are less error-prone.

#### Acceptance Criteria

1. **CRI-010**: All internal code references of `parent`/`child` for graph traversal are replaced with context-appropriate `outgoing`/`incoming` (edge direction) or `above`/`below` (layout positional) terminology.
2. **CRI-011**: All occurrences of `ancestor`/`descendant` are replaced with `upstream`/`downstream` (or equivalent chosen terms) where semantics remain correct.
3. **CRI-012**: No deprecated terms appear in tRPC outputs, persisted JSON exports, or new code (grep-based check passes).
4. **CRI-013**: Hard rename applied with no alias layer; type errors (if any) resolved under new terminology.

### REQ-004 Layout Invariance (Visual)

**User Story:** As a user reviewing existing topics, I want diagrams to look the same (except arrow orientation) so that historical spatial reasoning remains valid.

#### Acceptance Criteria

1. **CRI-014**: Node vertical partition ordering (as defined by `partitionOrders` in `layout.ts`) is unchanged for pre-migration topics after the change (excluding arrowheads pointing opposite direction).
2. **CRI-015**: Virtual edge flipping is applied only where necessary (problem → problem effect “causes” edges and effect → effect chains) to maintain former layout layering before passing to elkjs.
3. **CRI-016**: Automated layout regression test (snapshot or structural assertion) confirms identical rank assignments for a representative fixture set pre/post migration.
4. **CRI-017**: Performance of layout (execution time for fixture set) does not regress by a material amount (no deliberate optimization required; manual spot check documented).

### REQ-005 Hidden Neighbor Handle Logic Update

**User Story:** As a diagram explorer, I want hidden-neighbor indicators to remain accurate despite direction changes so that navigation cues are trustworthy.

#### Acceptance Criteria

1. **CRI-018**: Blue handle above a node displays when there exists at least one hidden outgoing neighbor (excluding special problem-effect exception below).
2. **CRI-019**: Blue handle below a node displays when there exists at least one hidden incoming neighbor (excluding special problem-effect exception below).
3. **CRI-020**: Exception: For nodes classified as problem effects, the above/below determination is inverted specifically for `causes` edges whose neighbor is a problem or problem effect.
4. **CRI-021**: Unit test or logic test verifies both standard and exception cases.

### REQ-006 Data Migration

**User Story:** As an operator, I want a fast, deterministic migration so that deployment risk and downtime are minimal.

#### Acceptance Criteria

1. **CRI-022**: Single Prisma/SQL migration updates all existing edges: adjusts direction (swapping source/target where required) and rewrites labels per mapping atomically.
2. **CRI-023**: Migration execution time for production scale estimate (≤ 300 topics; ≤ 1000 edges/topic) completes well under 10 seconds in staging measurement.
3. **CRI-024**: Migration includes a `down.sql` (or equivalent) reversal restoring original directions and labels.
4. **CRI-025**: No audit trail table is created (per scope) and no residual deprecated labels remain after `up`.
5. **CRI-026**: Legacy JSON import logic reuses existing versioned transformation path to upgrade old exports to new canonical schema.
6. **CRI-027**: Snapshot tests updated wholesale; no tests rely on deprecated labels afterward.

### REQ-007 Import & Export Compatibility

**User Story:** As a user importing an older topic export, I want it to load seamlessly so that historical backups remain usable.

#### Acceptance Criteria

1. **CRI-028**: Import of a pre-migration JSON (with version tag) succeeds and results in canonical direction/labels in memory.
2. **CRI-029**: Export after import re-serialization does not reintroduce deprecated labels or reversed edges.

### REQ-008 Validation & Developer Tooling

**User Story:** As a developer, I want safeguards preventing regression to deprecated patterns.

#### Acceptance Criteria

1. **CRI-030**: A lint or test assertion fails build if any deprecated label literal is introduced in source (deny-list string scan).
2. **CRI-031**: Traversal utility functions expose clearly named helpers (e.g. `getOutgoingEdges(nodeId)`) with no remaining `getParents`/`getChildren` utilities.
3. **CRI-032**: At least one traversal simplification example (e.g. effect classification) is refactored to use unified direction logic (documented inline comment referencing this requirement).

### REQ-009 Future Layout Config Forward-Compatibility

**User Story:** As a product planner, I want groundwork for a future option to place Solutions above Problems.

#### Acceptance Criteria

1. **CRI-033**: Requirements explicitly note (here) that solution/problem inversion is out of scope but no implementation choice blocks adding a config flag later (e.g. no hard-coded assumption that Problems are always top rank in new traversal utilities—use role-based partition mapping instead).

### REQ-010 Cycles & Edge Cases Preservation

**User Story:** As a power user creating complex graphs, I want existing permissive behaviors (like cycles) to remain.

#### Acceptance Criteria

1. **CRI-034**: Cycles remain allowed; direction standardization does not introduce new cycle validation failures.
2. **CRI-035**: Orphan nodes (zero degree or single-sided) remain displayed and unaffected by migration.

### REQ-011 Rollback Capability

**User Story:** As an operator, I want a reversible migration path to recover from unforeseen production issues.

#### Acceptance Criteria

1. **CRI-036**: `down.sql` (or Prisma down script) restores original labels and reversed directions deterministically given a database immediately after the `up` migration (idempotent within version pair context).
2. **CRI-037**: Rollback procedure documented in migration file header comments.

## Non-Functional Requirements

### PER-001 Performance

Layout runtime must not exhibit material regression (spot check only; no strict numeric bound required).

### OPR-001 Downtime

Migration completes within ≤ 10 seconds under production scale estimate.

### MNT-001 Maintainability

Deprecated terminology fully removed to reduce future onboarding cognitive load.

### INT-001 Interoperability

Legacy JSON imports auto-upgrade based on version flag with no manual user action.

## Related Specifications / Further Reading

- Mission & Vision (`docs-site/app/mission-vision/page.mdx`)
- Existing layout logic (`layout.ts` referencing `partitionOrders`)
- Topic JSON versioning & import logic (location TBD during implementation)

## Out of Scope

- Configurable inversion of Solutions above Problems (future enhancement only; see REQ-009 rationale).
