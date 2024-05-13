BEGIN;

-- DropForeignKey
ALTER TABLE "views" DROP CONSTRAINT "views_topicId_fkey";

-- DropTable
DROP TABLE "views";

-- DropEnum
DROP TYPE "ViewType";

COMMIT;
