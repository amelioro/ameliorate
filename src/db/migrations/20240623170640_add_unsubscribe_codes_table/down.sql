BEGIN;

-- DropForeignKey
ALTER TABLE "unsubscribeCodes" DROP CONSTRAINT "unsubscribeCodes_subscriberUsername_fkey";

-- DropIndex
DROP INDEX "subscriptions_subscriberUsername_sourceId_sourceType_key";

-- DropTable
DROP TABLE "unsubscribeCodes";

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_subscriberUsername_sourceId_key" ON "subscriptions"("subscriberUsername" ASC, "sourceId" ASC);

COMMIT;
