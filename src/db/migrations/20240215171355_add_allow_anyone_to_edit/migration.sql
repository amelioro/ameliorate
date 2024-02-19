BEGIN;

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "allowAnyoneToEdit" BOOLEAN NOT NULL DEFAULT false;

COMMIT;
