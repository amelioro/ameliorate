BEGIN;

UPDATE "edges"
SET
  "sourceId" = "targetId",
  "targetId" = "sourceId";

COMMIT;
