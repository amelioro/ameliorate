BEGIN;

-- AlterTable -- add column with a default so that all users have email set, since it should not be null
ALTER TABLE "users" ADD COLUMN     "email" VARCHAR(254) NOT NULL DEFAULT 'test@test.test';

-- AlterTable -- then remove email default because we'll always set it for new users.
ALTER TABLE "users" ALTER COLUMN "email" DROP DEFAULT;

-- for real users, we're just going to manually update their emails based on Auth0 data.

COMMIT;
