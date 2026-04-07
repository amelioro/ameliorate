BEGIN;

-- DropForeignKey
ALTER TABLE "public"."personalAccessTokens" DROP CONSTRAINT "personalAccessTokens_ownerUsername_fkey";

-- DropTable
DROP TABLE "public"."personalAccessTokens";

COMMIT;
