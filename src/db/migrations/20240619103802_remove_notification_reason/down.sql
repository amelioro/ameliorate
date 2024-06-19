BEGIN;

-- CreateEnum
CREATE TYPE "ReasonType" AS ENUM ('watching', 'subscribed');

-- AlterTable
ALTER TABLE "inAppNotifications" ADD COLUMN     "reason" "ReasonType" NOT NULL;

COMMIT;
