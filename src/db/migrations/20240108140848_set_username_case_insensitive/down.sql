BEGIN;

ALTER TABLE "users" ALTER username TYPE VARCHAR(39) COLLATE pg_catalog."default";
ALTER TABLE "topics" ALTER "creatorName" TYPE TEXT COLLATE pg_catalog."default";
ALTER TABLE "userScores" ALTER username TYPE TEXT COLLATE pg_catalog."default";

COMMIT;
