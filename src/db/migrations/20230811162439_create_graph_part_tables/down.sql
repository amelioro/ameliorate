BEGIN;

-- DropForeignKey
ALTER TABLE "nodes" DROP CONSTRAINT "nodes_topicId_fkey";

-- DropForeignKey
ALTER TABLE "edges" DROP CONSTRAINT "edges_topicId_fkey";

-- DropForeignKey
ALTER TABLE "edges" DROP CONSTRAINT "edges_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "edges" DROP CONSTRAINT "edges_targetId_fkey";

-- DropTable
DROP TABLE "nodes";

-- DropTable
DROP TABLE "edges";

-- DropEnum
DROP TYPE "NodeType";

-- DropEnum
DROP TYPE "EdgeType";

COMMIT;
