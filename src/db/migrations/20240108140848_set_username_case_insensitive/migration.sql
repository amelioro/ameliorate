BEGIN;

ALTER TABLE "users" ALTER username TYPE VARCHAR(39) COLLATE english_ci;
ALTER TABLE "topics" ALTER "creatorName" TYPE TEXT COLLATE english_ci;
ALTER TABLE "userScores" ALTER username TYPE TEXT COLLATE english_ci;

COMMIT;
