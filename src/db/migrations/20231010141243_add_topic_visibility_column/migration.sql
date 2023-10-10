BEGIN;

-- CreateEnum
CREATE TYPE "VisibilityType" AS ENUM ('public', 'unlisted', 'private');

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "visibility" "VisibilityType" NOT NULL DEFAULT 'public';

COMMIT;
