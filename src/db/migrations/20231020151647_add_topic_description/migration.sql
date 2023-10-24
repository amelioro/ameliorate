BEGIN;

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "description" VARCHAR(10000) NOT NULL DEFAULT '';

COMMIT;
