BEGIN;

-- AlterEnum
CREATE TYPE "NodeType_new" AS ENUM ('problem', 'solution', 'solutionComponent', 'criterion', 'effect', 'rootClaim', 'support', 'critique', 'question', 'answer', 'fact', 'source', 'custom', 'benefit', 'detriment', 'cause');
ALTER TABLE "nodes" ALTER COLUMN "type" TYPE "NodeType_new" USING ("type"::text::"NodeType_new");
ALTER TYPE "NodeType" RENAME TO "NodeType_old";
ALTER TYPE "NodeType_new" RENAME TO "NodeType";
DROP TYPE "NodeType_old";

-- AlterEnum
CREATE TYPE "EdgeType_new" AS ENUM ('causes', 'addresses', 'createdBy', 'has', 'criterionFor', 'creates', 'embodies', 'supports', 'critiques', 'asksAbout', 'potentialAnswerTo', 'relevantFor', 'sourceOf', 'relatesTo', 'accomplishes', 'mentions');
ALTER TABLE "edges" ALTER COLUMN "type" TYPE "EdgeType_new" USING ("type"::text::"EdgeType_new");
ALTER TYPE "EdgeType" RENAME TO "EdgeType_old";
ALTER TYPE "EdgeType_new" RENAME TO "EdgeType";
DROP TYPE "EdgeType_old";

COMMIT;
