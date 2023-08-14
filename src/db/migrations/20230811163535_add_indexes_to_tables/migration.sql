BEGIN;

-- CreateIndex
CREATE INDEX "edges_topicId_idx" ON "edges"("topicId");

-- CreateIndex
CREATE INDEX "edges_sourceId_idx" ON "edges"("sourceId");

-- CreateIndex
CREATE INDEX "edges_targetId_idx" ON "edges"("targetId");

-- CreateIndex
CREATE INDEX "nodes_topicId_idx" ON "nodes"("topicId");

-- CreateIndex
CREATE INDEX "topics_creatorId_idx" ON "topics"("creatorId");

-- CreateIndex
CREATE INDEX "userScores_userId_idx" ON "userScores"("userId");

-- CreateIndex
CREATE INDEX "userScores_graphPartId_idx" ON "userScores"("graphPartId");

-- CreateIndex
CREATE INDEX "userScores_topicId_idx" ON "userScores"("topicId");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_authId_idx" ON "users"("authId");

COMMIT;
