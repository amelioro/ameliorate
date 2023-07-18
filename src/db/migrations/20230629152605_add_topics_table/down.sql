BEGIN;

-- DropForeignKey
ALTER TABLE "topics" DROP CONSTRAINT "topics_userId_fkey";

-- DropTable
DROP TABLE "topics";

COMMIT;
