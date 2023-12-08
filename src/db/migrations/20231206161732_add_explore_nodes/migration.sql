BEGIN;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EdgeType" ADD VALUE 'asksAbout';
ALTER TYPE "EdgeType" ADD VALUE 'potentialAnswerTo';
ALTER TYPE "EdgeType" ADD VALUE 'relevantFor';
ALTER TYPE "EdgeType" ADD VALUE 'sourceOf';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NodeType" ADD VALUE 'question';
ALTER TYPE "NodeType" ADD VALUE 'answer';
ALTER TYPE "NodeType" ADD VALUE 'fact';
ALTER TYPE "NodeType" ADD VALUE 'source';

COMMIT;
