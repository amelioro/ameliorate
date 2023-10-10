BEGIN;

-- AlterTable
ALTER TABLE "topics" DROP COLUMN "visibility";

-- DropEnum
DROP TYPE "VisibilityType";

COMMIT;
