BEGIN;

INSERT INTO "watches" ("watcherUsername", "topicId", "type")
SELECT "topics"."creatorName", "topics"."id", 'all'
FROM "topics";

COMMIT;
