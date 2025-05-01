/*
  Warnings:

  - Changed the type of `title` on the `topics` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- AlterTable
ALTER TABLE "topics" ALTER COLUMN "title" TYPE CITEXT USING "title"::CITEXT;


