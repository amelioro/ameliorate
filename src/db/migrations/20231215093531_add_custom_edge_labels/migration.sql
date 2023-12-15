BEGIN;

-- AlterTable
ALTER TABLE "edges" ADD COLUMN     "customLabel" VARCHAR(30);

COMMIT;
