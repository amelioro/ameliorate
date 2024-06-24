BEGIN;

-- DropIndex
DROP INDEX "subscriptions_subscriberUsername_sourceId_key";

-- CreateTable
CREATE TABLE "unsubscribeCodes" (
    "code" TEXT NOT NULL,
    "subscriberUsername" TEXT NOT NULL,
    "subscriptionSourceId" TEXT,
    "subscriptionSourceType" "SubscriptionSourceType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unsubscribeCodes_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE INDEX "unsubscribeCodes_createdAt_idx" ON "unsubscribeCodes"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_subscriberUsername_sourceId_sourceType_key" ON "subscriptions"("subscriberUsername", "sourceId", "sourceType");

-- AddForeignKey
ALTER TABLE "unsubscribeCodes" ADD CONSTRAINT "unsubscribeCodes_subscriberUsername_fkey" FOREIGN KEY ("subscriberUsername") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
