BEGIN;

-- CreateTable
CREATE TABLE "personalAccessTokens" (
    "id" SERIAL NOT NULL,
    "ownerUsername" VARCHAR(39) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personalAccessTokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personalAccessTokens_tokenHash_key" ON "personalAccessTokens"("tokenHash");

-- CreateIndex
CREATE INDEX "personalAccessTokens_ownerUsername_idx" ON "personalAccessTokens"("ownerUsername");

-- AddForeignKey
ALTER TABLE "personalAccessTokens" ADD CONSTRAINT "personalAccessTokens_ownerUsername_fkey" FOREIGN KEY ("ownerUsername") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
