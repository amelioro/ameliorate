BEGIN;

-- AddForeignKey
ALTER TABLE "edges" ADD CONSTRAINT "edges_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edges" ADD CONSTRAINT "edges_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
