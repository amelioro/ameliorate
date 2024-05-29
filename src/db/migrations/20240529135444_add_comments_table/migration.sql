BEGIN;

-- CreateEnum
CREATE TYPE "CommentParentType" AS ENUM ('topic', 'node', 'edge', 'comment');

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "authorName" VARCHAR(39) NOT NULL,
    "topicId" INTEGER NOT NULL,
    "parentId" TEXT,
    "parentType" "CommentParentType" NOT NULL,
    "content" VARCHAR(10000) NOT NULL,
    "resolved" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "contentUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comments_topicId_idx" ON "comments"("topicId");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorName_fkey" FOREIGN KEY ("authorName") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
