BEGIN;

-- DropForeignKey
ALTER TABLE "topics" DROP CONSTRAINT "topics_creatorName_fkey";

-- DropForeignKey
ALTER TABLE "userScores" DROP CONSTRAINT "userScores_username_fkey";

-- DropIndex
DROP INDEX "topics_creatorName_idx";

-- DropIndex
DROP INDEX "topics_title_creatorName_key";

-- DropIndex
DROP INDEX "userScores_username_idx";

-- AlterTable
ALTER TABLE "topics" ALTER COLUMN "creatorName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "userScores" DROP CONSTRAINT "userScores_pkey",
ALTER COLUMN "username" DROP NOT NULL,
ADD CONSTRAINT "userScores_pkey" PRIMARY KEY ("userId", "graphPartId");

-- CreateIndex
CREATE INDEX "topics_creatorId_idx" ON "topics"("creatorId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "topics_title_creatorId_key" ON "topics"("title" ASC, "creatorId" ASC);

-- CreateIndex
CREATE INDEX "userScores_userId_idx" ON "userScores"("userId" ASC);

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userScores" ADD CONSTRAINT "userScores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
