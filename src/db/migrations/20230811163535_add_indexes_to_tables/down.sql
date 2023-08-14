BEGIN;

-- DropIndex
DROP INDEX "users_username_idx";

-- DropIndex
DROP INDEX "users_authId_idx";

-- DropIndex
DROP INDEX "topics_creatorId_idx";

-- DropIndex
DROP INDEX "nodes_topicId_idx";

-- DropIndex
DROP INDEX "edges_topicId_idx";

-- DropIndex
DROP INDEX "edges_sourceId_idx";

-- DropIndex
DROP INDEX "edges_targetId_idx";

-- DropIndex
DROP INDEX "userScores_userId_idx";

-- DropIndex
DROP INDEX "userScores_graphPartId_idx";

-- DropIndex
DROP INDEX "userScores_topicId_idx";

COMMIT;
