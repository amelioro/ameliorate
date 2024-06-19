BEGIN;

-- AlterTable
ALTER TABLE "inAppNotifications" DROP COLUMN "reason";

-- DropEnum
DROP TYPE "ReasonType";

COMMIT;
