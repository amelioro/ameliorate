BEGIN;

-- AlterEnum
ALTER TYPE "EdgeType" ADD VALUE 'mitigates';

-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'mitigationComponent';
ALTER TYPE "NodeType" ADD VALUE 'mitigation';

COMMIT;
