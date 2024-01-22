BEGIN;

-- AlterEnum
BEGIN;
CREATE TYPE "NodeType_new" AS ENUM ('problem', 'solution', 'solutionComponent', 'criterion', 'effect', 'rootClaim', 'support', 'critique', 'question', 'answer', 'fact', 'source', 'custom');
ALTER TABLE "nodes" ALTER COLUMN "type" TYPE "NodeType_new" USING ("type"::text::"NodeType_new");
ALTER TYPE "NodeType" RENAME TO "NodeType_old";
ALTER TYPE "NodeType_new" RENAME TO "NodeType";
DROP TYPE "NodeType_old";
COMMIT;

COMMIT;
