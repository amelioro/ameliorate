BEGIN;

-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('problem', 'solution', 'solutionComponent', 'criterion', 'effect', 'rootClaim', 'support', 'critique');

-- CreateEnum
CREATE TYPE "EdgeType" AS ENUM ('causes', 'addresses', 'createdBy', 'has', 'criterionFor', 'creates', 'embodies', 'supports', 'critiques');

-- CreateTable
CREATE TABLE "nodes" (
    "id" UUID NOT NULL,
    "topicId" INTEGER NOT NULL,
    "arguedDiagramPartId" UUID,
    "type" "NodeType" NOT NULL,
    "text" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edges" (
    "id" UUID NOT NULL,
    "topicId" INTEGER NOT NULL,
    "arguedDiagramPartId" UUID,
    "type" "EdgeType" NOT NULL,
    "sourceId" UUID NOT NULL,
    "targetId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "edges_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edges" ADD CONSTRAINT "edges_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edges" ADD CONSTRAINT "edges_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edges" ADD CONSTRAINT "edges_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
