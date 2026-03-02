BEGIN;

-- AlterEnum
CREATE TYPE "public"."EdgeType_new" AS ENUM ('causes', 'addresses', 'accomplishes', 'contingencyFor', 'has', 'criterionFor', 'fulfills', 'impedes', 'mitigates', 'asksAbout', 'potentialAnswerTo', 'relevantFor', 'sourceOf', 'mentions', 'supports', 'critiques', 'relatesTo');
ALTER TABLE "public"."edges" ALTER COLUMN "type" TYPE "public"."EdgeType_new" USING ("type"::text::"public"."EdgeType_new");
ALTER TYPE "public"."EdgeType" RENAME TO "EdgeType_old";
ALTER TYPE "public"."EdgeType_new" RENAME TO "EdgeType";
DROP TYPE "EdgeType_old";

COMMIT;
