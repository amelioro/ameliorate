BEGIN;

-- CreateTable
CREATE TABLE "topics" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "topics_title_userId_key" ON "topics"("title", "userId");

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
