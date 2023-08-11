-- DropForeignKey
ALTER TABLE "topics" DROP CONSTRAINT "topics_creatorId_fkey";

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

