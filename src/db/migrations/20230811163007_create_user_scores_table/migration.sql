BEGIN;

-- CreateTable
CREATE TABLE "userScores" (
    "userId" INTEGER NOT NULL,
    "graphPartId" UUID NOT NULL,
    "topicId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userScores_pkey" PRIMARY KEY ("userId","graphPartId")
);

-- AddForeignKey
ALTER TABLE "userScores" ADD CONSTRAINT "userScores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userScores" ADD CONSTRAINT "userScores_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
