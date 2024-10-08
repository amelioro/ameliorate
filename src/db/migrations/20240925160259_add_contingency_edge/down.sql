BEGIN;

-- AlterEnum
BEGIN;
CREATE TYPE "EdgeType_new" AS ENUM ('causes', 'addresses', 'createdBy', 'has', 'criterionFor', 'creates', 'embodies', 'supports', 'critiques', 'asksAbout', 'potentialAnswerTo', 'relevantFor', 'sourceOf', 'relatesTo', 'accomplishes', 'mentions', 'obstacleOf', 'subproblemOf');
ALTER TABLE "edges" ALTER COLUMN "type" TYPE "EdgeType_new" USING ("type"::text::"EdgeType_new");
ALTER TYPE "EdgeType" RENAME TO "EdgeType_old";
ALTER TYPE "EdgeType_new" RENAME TO "EdgeType";
DROP TYPE "EdgeType_old";
COMMIT;

COMMIT;
