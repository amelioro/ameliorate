BEGIN;

ALTER TYPE "NodeType" ADD VALUE 'benefit';
ALTER TYPE "NodeType" ADD VALUE 'detriment';

COMMIT;
