-- can't properly rollback with data and NOT NULL but maybe this is better than nothing?
BEGIN;

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "creatorId" INTEGER;

-- AlterTable
ALTER TABLE "userScores" ADD COLUMN     "userId" INTEGER;

COMMIT;
