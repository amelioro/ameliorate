BEGIN;

-- DropForeignKey
ALTER TABLE "edges" DROP CONSTRAINT "edges_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "edges" DROP CONSTRAINT "edges_targetId_fkey";

COMMIT;
