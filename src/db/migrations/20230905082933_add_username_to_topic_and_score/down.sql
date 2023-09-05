BEGIN;

-- AlterTable
ALTER TABLE "topics" DROP COLUMN "creatorName";

-- AlterTable
ALTER TABLE "userScores" DROP COLUMN "username";

COMMIT;
