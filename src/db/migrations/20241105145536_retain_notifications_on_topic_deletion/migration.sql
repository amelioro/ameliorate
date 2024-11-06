BEGIN;

-- DropForeignKey
ALTER TABLE "inAppNotifications" DROP CONSTRAINT "inAppNotifications_topicId_fkey";

-- AlterTable
ALTER TABLE "inAppNotifications" ALTER COLUMN "topicId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "inAppNotifications" ADD CONSTRAINT "inAppNotifications_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
