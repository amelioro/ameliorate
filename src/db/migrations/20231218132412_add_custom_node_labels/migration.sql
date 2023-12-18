BEGIN;

-- AlterTable
ALTER TABLE "nodes" ADD COLUMN     "customType" VARCHAR(30);

COMMIT;
