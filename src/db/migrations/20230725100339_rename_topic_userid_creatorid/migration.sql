BEGIN;

-- DropForeignKey
ALTER TABLE "topics" DROP CONSTRAINT "topics_userId_fkey";

-- DropIndex
DROP INDEX "topics_title_userId_key";

-- AlterTable
ALTER TABLE "topics" RENAME COLUMN "userId" TO "creatorId"; -- manually written, let's preserve data, downtime is fine because there aren't [m]any users

-- CreateIndex
CREATE UNIQUE INDEX "topics_title_creatorId_key" ON "topics"("title", "creatorId");

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
