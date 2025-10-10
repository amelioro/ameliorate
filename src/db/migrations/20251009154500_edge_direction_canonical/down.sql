BEGIN;

CREATE TYPE "EdgeType_old" AS ENUM (
  'causes',
  'subproblemOf',
  'addresses',
  'accomplishes',
  'contingencyFor',
  'createdBy',
  'has',
  'criterionFor',
  'creates',
  'fulfills',
  'obstacleOf',
  'mitigates',
  'asksAbout',
  'potentialAnswerTo',
  'relevantFor',
  'sourceOf',
  'mentions',
  'supports',
  'critiques',
  'relatesTo'
);

ALTER TABLE "edges" ALTER COLUMN "type" TYPE "EdgeType_old" USING "type"::text::"EdgeType_old";

WITH edges_with_nodes AS (
  SELECT
    e.id,
    e.type,
    e."sourceId",
    e."targetId",
    source_node.type AS source_type,
    target_node.type AS target_type
  FROM "edges" e
  JOIN "nodes" source_node ON source_node.id = e."sourceId"
  JOIN "nodes" target_node ON target_node.id = e."targetId"
),
updates AS (
  SELECT
    id,
    CASE
      WHEN type = 'has' AND source_type = 'problem' AND target_type = 'problem' THEN 'subproblemOf'
      WHEN type = 'causes' AND source_type = 'problem' AND target_type IN ('benefit', 'effect', 'detriment') THEN 'createdBy'
      WHEN type = 'causes' AND source_type IN ('solution', 'solutionComponent', 'mitigation', 'mitigationComponent') AND target_type IN ('benefit', 'effect', 'detriment') THEN 'creates'
      WHEN type = 'impedes' AND source_type IN ('solution', 'solutionComponent', 'mitigation', 'mitigationComponent') AND target_type = 'obstacle' THEN 'obstacleOf'
      ELSE type::text
    END AS revert_type,
    CASE
      WHEN type = 'has' AND source_type = 'problem' AND target_type = 'problem' THEN "sourceId"
      WHEN type = 'causes' AND source_type = 'problem' AND target_type IN ('benefit', 'effect', 'detriment') THEN "sourceId"
      WHEN type = 'causes' AND source_type IN ('solution', 'solutionComponent', 'mitigation', 'mitigationComponent') AND target_type IN ('benefit', 'effect', 'detriment') THEN "targetId"
      WHEN type = 'impedes' AND source_type IN ('solution', 'solutionComponent', 'mitigation', 'mitigationComponent') AND target_type = 'obstacle' THEN "targetId"
      ELSE "targetId"
    END AS revert_source,
    CASE
      WHEN type = 'has' AND source_type = 'problem' AND target_type = 'problem' THEN "targetId"
      WHEN type = 'causes' AND source_type = 'problem' AND target_type IN ('benefit', 'effect', 'detriment') THEN "targetId"
      WHEN type = 'causes' AND source_type IN ('solution', 'solutionComponent', 'mitigation', 'mitigationComponent') AND target_type IN ('benefit', 'effect', 'detriment') THEN "sourceId"
      WHEN type = 'impedes' AND source_type IN ('solution', 'solutionComponent', 'mitigation', 'mitigationComponent') AND target_type = 'obstacle' THEN "sourceId"
      ELSE "sourceId"
    END AS revert_target
  FROM edges_with_nodes
)
UPDATE "edges" e
SET
  "type" = updates.revert_type::"EdgeType_old",
  "sourceId" = updates.revert_source,
  "targetId" = updates.revert_target
FROM updates
WHERE e.id = updates.id;

ALTER TYPE "EdgeType" RENAME TO "EdgeType_new";
ALTER TYPE "EdgeType_old" RENAME TO "EdgeType";
DROP TYPE "EdgeType_new";

COMMIT;
