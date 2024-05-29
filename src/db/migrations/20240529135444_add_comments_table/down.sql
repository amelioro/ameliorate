BEGIN;

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_authorName_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_topicId_fkey";

-- DropTable
DROP TABLE "comments";

-- DropEnum
DROP TYPE "CommentParentType";

COMMIT;
