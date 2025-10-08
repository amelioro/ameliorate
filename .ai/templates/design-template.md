# Design Document

## Introduction

[Provide a high-level overview of the implementation strategy for the feature.]

## Alternatives

[A bullet point list of any alternative implementation approaches that were considered and why they were not chosen. This helps to provide context and rationale for the chosen approach. Do not list alternatives that are already listed in the requirements's Alternatives section.]

- **ALT-001**: [title] - rejected because [reason(s)].
- **ALT-002**: [title] - rejected because [reason(s)].

## Relevant Existing Code

[Provide a high-level overview of the existing areas of the codebase that may be affected and need to change.]
[Include mermaid diagrams if it seems useful to model complex interactions or relations.]

## Implementation Plan

[Note: Identify distinct phases that group similar changes together. Assume that these will be done in order.]

### Phase 1: [title]

- **GOAL-001** ([status: completed✅ or TODO🔳]): [Describe the goal of this phase, e.g., "Implement database changes", "Replace all references of X", "Implement core logic for Y", etc.]

#### Dependencies

[List any dependencies that will be relevant for this phase, such as libraries, frameworks, or other components that the plan relies on.]

- **DEP-001 [dependency title 1]**: [description of relevance. provide links to relevant external documentation if necessary.]
- **DEP-002 [dependency title 2]**: [description of relevance. provide links to relevant external documentation if necessary.]

#### Implementation concerns

[List concerns with implementing this phase, and any assumptions being made. Consider issues of integrating with existing code.]

- **RISK-001**: [description of risk]
- **ASSUMPTION-001**: [description of assumption]

#### Testing strategy

##### Automated tests

[List automated tests that can be run to ensure confidence in the correctness of this phase's implementation. Note the test's status as "exists"/"needs updating"/"needs implementing".]

- **TEST-001** [test file name] ([status]): [description of test]
- **TEST-002** [test file name] ([status]): [description of test]

##### Manual tests

[(optional) If automated tests are not enough on their own to ensure confidence in this phase's implementation, list manual tests that can do so.]

- **TEST-003**: [description of test]
- **TEST-004**: [description of test]

#### Files

[A list of files that are affected and need to be changed.]

- **FILE-001 [file path 1]**: [description of expected relevance and how each impacted top-level method and variable needs to change]
- **FILE-002 [file path 2]**: [description of expected relevance and how each impacted top-level method and variable needs to change]

#### Relevant pseudo-code or algorithms [optional]

[If any method-level changes are expected to be complicated, use this section to flesh them out.]

##### MET-001 [title describing designed method-level changes]

[method-level design]

##### MET-002 [title describing designed method-level changes]

[method-level design]

### Phase 2: [title]

- **GOAL-002** ([status: completed✅ or TODO🔳]): [Describe the goal of this phase, e.g., "Implement database changes", "Replace all references of X", "Implement core logic for Y", etc.]
- (optional) Related requirements: [e.g. REQ-001, REQ-004, etc.]

#### Dependencies

[List any dependencies that will be relevant for this phase, such as libraries, frameworks, or other components that the plan relies on.]

- **DEP-003 [dependency title 1]**: [description of relevance. provide links to relevant external documentation if necessary.]
- **DEP-004 [dependency title 2]**: [description of relevance. provide links to relevant external documentation if necessary.]

#### Implementation concerns

[List concerns with implementing this phase, and any assumptions being made. Consider issues of integrating with existing code.]

- **RISK-002**: [description of risk]
- **ASSUMPTION-002**: [description of assumption]

#### Testing strategy

##### Automated tests

[List automated tests that can be run to ensure confidence in the correctness of this phase's implementation. Note the test's status as "exists"/"needs updating"/"needs implementing".]

- **TEST-005** [test file name] ([status]): [description of test]
- **TEST-006** [test file name] ([status]): [description of test]

##### Manual tests

[(optional) If automated tests are not enough on their own to ensure confidence in this phase's implementation, list manual tests that can do so.]

- **TEST-007**: [description of test]
- **TEST-008**: [description of test]

#### Files

[A list of files that are affected and need to be changed.]

- **FILE-003 [file path 1]**: [description of expected relevance and how each impacted top-level method and variable needs to change]
- **FILE-004 [file path 2]**: [description of expected relevance and how each impacted top-level method and variable needs to change]

#### Relevant pseudo-code or algorithms [optional]

[If any method-level changes are expected to be complicated, use this section to flesh them out.]

##### MET-003 [title describing designed method-level changes]

[method-level design]

##### MET-004 [title describing designed method-level changes]

[method-level design]
