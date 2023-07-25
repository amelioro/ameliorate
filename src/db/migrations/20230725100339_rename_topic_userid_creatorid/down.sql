BEGIN;

-- DropForeignKey
ALTER TABLE "topics" DROP CONSTRAINT "topics_creatorId_fkey";

-- DropIndex
DROP INDEX "topics_title_creatorId_key";

-- AlterTable
ALTER TABLE "topics" RENAME COLUMN "creatorId" TO "userId"; -- manually written

-- CreateIndex
CREATE UNIQUE INDEX "topics_title_userId_key" ON "topics"("title" ASC, "userId" ASC);

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
