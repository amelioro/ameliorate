BEGIN;

-- DropForeignKey
ALTER TABLE "topics" DROP CONSTRAINT "topics_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "userScores" DROP CONSTRAINT "userScores_userId_fkey";

-- DropIndex
DROP INDEX "topics_creatorId_idx";

-- DropIndex
DROP INDEX "topics_title_creatorId_key";

-- DropIndex
DROP INDEX "userScores_userId_idx";

-- AlterTable
ALTER TABLE "topics" ALTER COLUMN "creatorName" SET NOT NULL;

-- AlterTable
ALTER TABLE "userScores" DROP CONSTRAINT "userScores_pkey",
ALTER COLUMN "username" SET NOT NULL,
ADD CONSTRAINT "userScores_pkey" PRIMARY KEY ("username", "graphPartId");

-- CreateIndex
CREATE INDEX "topics_creatorName_idx" ON "topics"("creatorName");

-- CreateIndex
CREATE UNIQUE INDEX "topics_title_creatorName_key" ON "topics"("title", "creatorName");

-- CreateIndex
CREATE INDEX "userScores_username_idx" ON "userScores"("username");

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_creatorName_fkey" FOREIGN KEY ("creatorName") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userScores" ADD CONSTRAINT "userScores_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
