BEGIN;

UPDATE "topics"
SET "creatorName" = "users"."username"
FROM "users"
WHERE "topics"."creatorId" = "users"."id";

UPDATE "userScores"
SET "username" = "users"."username"
FROM "users"
WHERE "userScores"."userId" = "users"."id";

COMMIT;
