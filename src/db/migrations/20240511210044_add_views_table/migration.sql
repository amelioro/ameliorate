BEGIN;

-- CreateEnum
CREATE TYPE "ViewType" AS ENUM ('shared', 'quick');

-- CreateTable
CREATE TABLE "views" (
    "id" TEXT NOT NULL,
    "topicId" INTEGER NOT NULL,
    "type" "ViewType" NOT NULL,
    "title" VARCHAR(100),
    "order" INTEGER,
    "viewState" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "views_topicId_idx" ON "views"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "views_topicId_title_key" ON "views"("topicId", "title");

-- AddForeignKey
ALTER TABLE "views" ADD CONSTRAINT "views_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
