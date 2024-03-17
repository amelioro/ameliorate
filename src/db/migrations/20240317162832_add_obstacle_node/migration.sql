BEGIN;

-- AlterEnum
ALTER TYPE "EdgeType" ADD VALUE 'obstacleOf';

-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'obstacle';

COMMIT;
