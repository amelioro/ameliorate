BEGIN;

-- AlterTable
ALTER TABLE "nodes" DROP COLUMN "notes";

-- AlterTable
ALTER TABLE "edges" DROP COLUMN "notes";

COMMIT;
