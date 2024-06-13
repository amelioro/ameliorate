BEGIN;

-- DropForeignKey
ALTER TABLE "inAppNotifications" DROP CONSTRAINT "inAppNotifications_notifiedUsername_fkey";

-- DropForeignKey
ALTER TABLE "inAppNotifications" DROP CONSTRAINT "inAppNotifications_topicId_fkey";

-- DropForeignKey
ALTER TABLE "watches" DROP CONSTRAINT "watches_watcherUsername_fkey";

-- DropForeignKey
ALTER TABLE "watches" DROP CONSTRAINT "watches_topicId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_subscriberUsername_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "receiveEmailNotifications";

-- DropTable
DROP TABLE "inAppNotifications";

-- DropTable
DROP TABLE "watches";

-- DropTable
DROP TABLE "subscriptions";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "ReasonType";

-- DropEnum
DROP TYPE "WatchType";

-- DropEnum
DROP TYPE "SubscriptionSourceType";

COMMIT;
