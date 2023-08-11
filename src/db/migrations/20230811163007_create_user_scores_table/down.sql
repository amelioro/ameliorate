BEGIN;

-- DropForeignKey
ALTER TABLE "userScores" DROP CONSTRAINT "userScores_userId_fkey";

-- DropForeignKey
ALTER TABLE "userScores" DROP CONSTRAINT "userScores_topicId_fkey";

-- DropTable
DROP TABLE "userScores";

COMMIT;
