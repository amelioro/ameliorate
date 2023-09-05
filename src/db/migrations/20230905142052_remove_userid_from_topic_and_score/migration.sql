BEGIN;

-- AlterTable
ALTER TABLE "topics" DROP COLUMN "creatorId";

-- AlterTable
ALTER TABLE "userScores" DROP COLUMN "userId";

COMMIT;
