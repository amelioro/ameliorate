BEGIN;

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "creatorName" TEXT;

-- AlterTable
ALTER TABLE "userScores" ADD COLUMN     "username" TEXT;

COMMIT;
