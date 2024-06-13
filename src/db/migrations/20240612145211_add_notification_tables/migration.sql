BEGIN;

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('commentCreated');

-- CreateEnum
CREATE TYPE "ReasonType" AS ENUM ('watching', 'subscribed');

-- CreateEnum
CREATE TYPE "WatchType" AS ENUM ('participatingOrMentions', 'all', 'ignore');

-- CreateEnum
CREATE TYPE "SubscriptionSourceType" AS ENUM ('threadStarterComment');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "receiveEmailNotifications" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "inAppNotifications" (
    "id" SERIAL NOT NULL,
    "notifiedUsername" VARCHAR(39) NOT NULL,
    "type" "NotificationType" NOT NULL,
    "topicId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "sourceUrl" VARCHAR(1000) NOT NULL,
    "reason" "ReasonType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inAppNotifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watches" (
    "id" SERIAL NOT NULL,
    "watcherUsername" VARCHAR(39) NOT NULL,
    "topicId" INTEGER NOT NULL,
    "type" "WatchType" NOT NULL,

    CONSTRAINT "watches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "subscriberUsername" VARCHAR(39) NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceType" "SubscriptionSourceType" NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inAppNotifications_notifiedUsername_idx" ON "inAppNotifications"("notifiedUsername");

-- CreateIndex
CREATE INDEX "watches_watcherUsername_idx" ON "watches"("watcherUsername");

-- CreateIndex
CREATE INDEX "watches_topicId_idx" ON "watches"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "watches_watcherUsername_topicId_key" ON "watches"("watcherUsername", "topicId");

-- CreateIndex
CREATE INDEX "subscriptions_subscriberUsername_idx" ON "subscriptions"("subscriberUsername");

-- CreateIndex
CREATE INDEX "subscriptions_sourceId_idx" ON "subscriptions"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_subscriberUsername_sourceId_key" ON "subscriptions"("subscriberUsername", "sourceId");

-- AddForeignKey
ALTER TABLE "inAppNotifications" ADD CONSTRAINT "inAppNotifications_notifiedUsername_fkey" FOREIGN KEY ("notifiedUsername") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inAppNotifications" ADD CONSTRAINT "inAppNotifications_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watches" ADD CONSTRAINT "watches_watcherUsername_fkey" FOREIGN KEY ("watcherUsername") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watches" ADD CONSTRAINT "watches_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriberUsername_fkey" FOREIGN KEY ("subscriberUsername") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
