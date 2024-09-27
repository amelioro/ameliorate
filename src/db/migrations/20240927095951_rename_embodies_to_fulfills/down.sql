BEGIN;

-- AlterEnum
CREATE TYPE "EdgeType_intermediate" AS ENUM ('causes', 'subproblemOf', 'addresses', 'accomplishes', 'contingencyFor', 'createdBy', 'has', 'criterionFor', 'creates', 'fulfills', 'embodies', 'obstacleOf', 'asksAbout', 'potentialAnswerTo', 'relevantFor', 'sourceOf', 'mentions', 'supports', 'critiques', 'relatesTo');
ALTER TABLE "edges" ALTER COLUMN "type" TYPE "EdgeType_intermediate" USING ("type"::text::"EdgeType_intermediate");
ALTER TYPE "EdgeType" RENAME TO "EdgeType_old";
ALTER TYPE "EdgeType_intermediate" RENAME TO "EdgeType";
DROP TYPE "EdgeType_old";

UPDATE "edges" SET "type" = 'embodies' WHERE "type" = 'fulfills';

CREATE TYPE "EdgeType_new" AS ENUM ('causes', 'subproblemOf', 'addresses', 'accomplishes', 'contingencyFor', 'createdBy', 'has', 'criterionFor', 'creates', 'embodies', 'obstacleOf', 'asksAbout', 'potentialAnswerTo', 'relevantFor', 'sourceOf', 'mentions', 'supports', 'critiques', 'relatesTo');
ALTER TABLE "edges" ALTER COLUMN "type" TYPE "EdgeType_new" USING ("type"::text::"EdgeType_new");
ALTER TYPE "EdgeType" RENAME TO "EdgeType_old";
ALTER TYPE "EdgeType_new" RENAME TO "EdgeType";
DROP TYPE "EdgeType_old";

COMMIT;
