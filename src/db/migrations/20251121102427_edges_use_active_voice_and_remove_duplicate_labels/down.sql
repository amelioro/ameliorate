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

-- revert edge types using mapping
-- note: DATA LOSS - cannot revert 'subproblemOf' -> 'has' or 'createdBy'/'creates' -> 'causes' without complicated checking of node types. seems ok.
-- note2: MUST also revert the code deployment, since "obstacleOf" won't be in the common/edge.ts enum anymore. this is where we'd ideally do a multi-stage
-- phase out but it shouldn't be a big deal to shortcut this and manually deal with the rollback if need be
UPDATE "edges"
SET
  "type" = CASE
    WHEN "type" = 'impedes' THEN 'obstacleOf'
    ELSE "type"
  END;

CREATE TYPE "EdgeType_new" AS ENUM (
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

ALTER TABLE "edges" ALTER COLUMN "type" TYPE "EdgeType_new" USING ("type"::text::"EdgeType_new");
ALTER TYPE "EdgeType" RENAME TO "EdgeType_old";
ALTER TYPE "EdgeType_new" RENAME TO "EdgeType";
DROP TYPE "EdgeType_old";

COMMIT;
