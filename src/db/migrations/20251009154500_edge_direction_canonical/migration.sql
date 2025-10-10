BEGIN;

CREATE TYPE "EdgeType_intermediate" AS ENUM (
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
  'impedes',
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

ALTER TABLE "edges" ALTER COLUMN "type" TYPE "EdgeType_intermediate" USING ("type"::text::"EdgeType_intermediate");
ALTER TYPE "EdgeType" RENAME TO "EdgeType_old";
ALTER TYPE "EdgeType_intermediate" RENAME TO "EdgeType";
DROP TYPE "EdgeType_old";

UPDATE "edges"
SET
  "type" = CASE
    WHEN "type" = 'subproblemOf' THEN 'has'
    WHEN "type" = 'createdBy' THEN 'causes'
    WHEN "type" = 'creates' THEN 'causes'
    WHEN "type" = 'obstacleOf' THEN 'impedes'
    ELSE "type"
  END,
  "sourceId" = CASE
    WHEN "type" IN ('subproblemOf', 'createdBy') THEN "sourceId"
    ELSE "targetId"
  END,
  "targetId" = CASE
    WHEN "type" IN ('subproblemOf', 'createdBy') THEN "targetId"
    ELSE "sourceId"
  END;

CREATE TYPE "EdgeType_new" AS ENUM (
  'causes',
  'has',
  'addresses',
  'accomplishes',
  'contingencyFor',
  'criterionFor',
  'fulfills',
  'impedes',
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

ALTER TABLE "edges" ALTER COLUMN "type" TYPE "EdgeType_new" USING ("type"::text::"EdgeType_new");
ALTER TYPE "EdgeType" RENAME TO "EdgeType_old";
ALTER TYPE "EdgeType_new" RENAME TO "EdgeType";
DROP TYPE "EdgeType_old";

COMMIT;
