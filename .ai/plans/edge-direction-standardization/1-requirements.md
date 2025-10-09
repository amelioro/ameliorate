# Requirements Document

## Introduction

Problems being addressed:

1. Inverted edge direction (many edges currently point target → source / visually upward).
2. Mixed grammatical perspectives in labels (`creates` vs `createdBy`).
3. Duplicate conceptual relation labels (`creates`, `createdBy`, `causes`).
4. Ambiguous traversal/layout terminology (`parent/child`, `ancestor/descendant`).

Solution components:

1. Standardize all topic-level edges to flow source → target semantically.
2. Collapse duplicate / reverse-form labels into one canonical label per relation concept.
3. Replace traversal/layout terminology: parent/child → source/target (edge direction) or above/below (layout positional); ancestor/descendant → downstream/upstream (investigate each usage; downstream/upstream might not cover every prior usage, but all ancestor/descendant references will be removed/refactored).

Canonical topic relation labels, with legacy -> new mapping and direction changes (legacy stored direction is target → source):

- causes (flip direction)
- has (flip direction)
- addresses (flip direction)
- accomplishes (flip direction)
- contingencyFor (flip direction)
- criterionFor (flip direction)
- fulfills (flip direction)
- impedes (flip direction)
- mitigates (flip direction)
- subproblemOf → has (direction unchanged)
- createdBy → causes (direction unchanged)
- creates → causes (flip direction)
- obstacleOf → impedes (flip direction)
- relatesTo (flip direction)

(Research / justification labels unchanged, with flipped direction)

## Considered Alternatives

- **ALT-001**: Update only labels while retaining mixed directions – rejected because traversal complexity and mental model confusion would persist.

## Alignment with Product Vision

Consistent, intuitive graph semantics reduce friction in understanding complex problem/solution structures, directly supporting the mission to make mutual understanding of intricacies trivial. Standardized direction and labeling simplify user reasoning (cleaner edge vocabulary) and developer tooling (simpler traversal and future analytics), enabling clearer collaborative problem decomposition.

## Requirements

### REQ-001 Edge Normalization

**User Story:** As a topic editor, I want all edges to read naturally from source to target so that diagrams are quicker to interpret and author.

#### Acceptance Criteria

1. **CRI-001**: Legacy labels (`subproblemOf`, `createdBy`, `creates`, `obstacleOf`) are fully replaced per canonical mapping with no remaining occurrences in the project. Directions flip for every relation except legacy `subproblemOf` and `createdBy`, which retain their stored orientation when renamed.
2. **CRI-002**: Arrowheads in the diagram visually point from semantic source to semantic target for all canonical relation types after the stored direction flips are applied.
3. **CRI-003**: Research / justification / generic labels remain unchanged while their stored direction flips to canonical source → target.

### REQ-002 Traversal Terminology Refactor

**User Story:** As a developer, I want traversal and layout code to use directionally consistent neutral terms so that maintenance and feature additions are less error-prone.

#### Acceptance Criteria

1. **CRI-004**: All occurrences of `parent`/`child` are replaced with context-appropriate `target`/`source` (edge direction) or `above`/`below` (layout positional) terminology.
2. **CRI-005**: All occurrences of `ancestor`/`descendant` are removed; wherever semantically correct they are replaced with `downstream`/`upstream`; contexts where that pair is insufficient are refactored to explicit alternative terminology/logic, which will have to be determined.

### REQ-003 Layout Invariance (Visual)

**User Story:** As a user reviewing existing topics, I want diagrams to look the same (except arrow orientation) so that historical spatial reasoning remains valid.

#### Acceptance Criteria

1. **CRI-006**: Node vertical partition ordering (as defined by `partitionOrders` in `layout.ts`) is unchanged for pre-migration topics after the change (excluding arrowheads pointing opposite direction).
2. **CRI-007**: Layout preprocessing (either via virtual flipping or elkjs config) prevents different layout than before, specifically for edges being flipped i.e. (a) problem effect incoming `causes` edges and (b) problem incoming `has` edges.
3. **CRI-008**: Automated layout regression test (snapshot or structural assertion) confirms identical rank assignments for a representative fixture set pre/post migration.

### REQ-004 Hidden Neighbor Handle Logic Update

**User Story:** As a diagram explorer, I want hidden-neighbor indicators to remain accurate despite direction changes so that navigation cues are trustworthy.

#### Acceptance Criteria

1. **CRI-009**: Blue handle above a node displays when there exists at least one hidden target (outgoing) neighbor (excluding special exceptions below).
2. **CRI-010**: Blue handle below a node displays when there exists at least one hidden source (incoming) neighbor (excluding special exceptions below).
3. **CRI-011**: Exceptions: For traversing edges to determine neighbors that are above/below, `causes` edges incoming from problems or problem effects to problem effects, and `has` edges incoming from problems to problems, the above/below determination is inverted.
4. **CRI-012**: Unit test or logic test verifies both standard and exception cases.

### REQ-005 Data Migration

**User Story:** As an operator, I want a fast, deterministic migration so that deployment risk and downtime are minimal.

#### Acceptance Criteria

1. **CRI-013**: Single transaction (schema + data) migration adds new labels to schema, rewrites labels per mapping and adjusts direction (swapping source/target where required), then removes old labels from schema.
2. **CRI-014**: Migration execution time for production scale estimate (≤ 300 topics; ≤ 1000 edges/topic) completes within ≤ 10 seconds in staging measurement.
3. **CRI-015**: Migration includes `down.sql` restoring original directions, legacy labels, and original schema enum values.
4. **CRI-016**: Persisted diagram store data is migrated (on load).

### REQ-006 Import & Export Compatibility

**User Story:** As a user importing an older topic export, I want it to load seamlessly so that historical backups remain usable.

#### Acceptance Criteria

1. **CRI-017**: Import of a pre-migration JSON (with version tag) succeeds and results in canonical direction/labels in memory.

## Non-Functional Requirements

### OPR-001 Downtime

Migration completes within ≤ 10 seconds under production scale estimate.

## Related Specifications / Further Reading

- Mission & Vision (`docs-site/app/mission-vision/page.mdx`)
- `src/common/edge.ts` — relation names and schemas (current source of truth)
- `src/web/topic/utils/graph.ts` and `src/web/topic/utils/node.ts` — neighbors, parents/children utilities
- Existing layout logic (`layout.ts` referencing `partitionOrders`)
- Diagram store version-based import logic (`loadStores.ts` – `uploadTopic()`)

## Out of Scope

- Configurable inversion of Solutions above Problems (future enhancement only).
