/* eslint-disable functional/no-let -- let is needed to reuse `before`-initialized variables across tests */
import { InAppNotification, Topic, User } from "@prisma/client";
import shortUUID from "short-uuid";
import { beforeEach, describe, expect, test } from "vitest";

import {
  getInAppNotificationMessage,
  handleCommentCreated,
} from "@/api/notifications/commentCreated";
import { Comment, CommentParent, CommentParentType } from "@/common/comment";
import { ReasonType } from "@/common/inAppNotification";
import { xprisma } from "@/db/extendedPrisma";

let creatorOfTopic: User;
let topicWithoutAllowAnyEdit: Topic;

let authorWatcherSubscriber: User;
let commentWithTopicParent: Comment;

let watcherSubscriber: User;
let watcherNotSubscriber: User;
let notWatcherNotSubscriber: User;
let notWatcherIsSubscriber: User;
let ignorerSubscriber: User;
let ignorerNotSubscriber: User;

let commentWithCommentParent: Comment;

const generateComment = (
  author: User,
  topic: Topic,
  parent: CommentParent,
  parentType: CommentParentType,
  content?: string
): Comment => {
  const time = new Date();
  const isChildComment = parent !== null;

  return {
    id: shortUUID.generate(),
    authorName: author.username,
    topicId: topic.id,
    parentId: isChildComment ? parent.id : null,
    parentType: parentType,
    content: content ?? "blah",
    resolved: isChildComment ? null : false,
    createdAt: time,
    contentUpdatedAt: time,
  };
};

beforeEach(async () => {
  creatorOfTopic = await xprisma.user.create({
    data: { username: "creatorOfTopic", authId: "creatorOfTopic" },
  });
  topicWithoutAllowAnyEdit = await xprisma.topic.create({
    data: {
      title: "topicWithoutAllowAnyEdit",
      creatorName: creatorOfTopic.username,
      visibility: "public",
      allowAnyoneToEdit: false,
    },
  });

  authorWatcherSubscriber = await xprisma.user.create({
    data: { username: "authorWatcherSubscriber", authId: "authorWatcherSubscriber" },
  });
  commentWithTopicParent = await xprisma.comment.create({
    data: generateComment(authorWatcherSubscriber, topicWithoutAllowAnyEdit, null, "topic"),
  });
  await xprisma.watch.create({
    data: {
      topicId: topicWithoutAllowAnyEdit.id,
      watcherUsername: authorWatcherSubscriber.username,
      type: "all",
    },
  });
  await xprisma.subscription.create({
    data: {
      sourceId: commentWithTopicParent.id,
      sourceType: "threadStarterComment",
      subscriberUsername: authorWatcherSubscriber.username,
    },
  });

  watcherSubscriber = await xprisma.user.create({
    data: { username: "watcherSubscriber", authId: "watcherSubscriber" },
  });
  await xprisma.watch.create({
    data: {
      topicId: topicWithoutAllowAnyEdit.id,
      watcherUsername: watcherSubscriber.username,
      type: "all",
    },
  });
  await xprisma.subscription.create({
    data: {
      sourceId: commentWithTopicParent.id,
      sourceType: "threadStarterComment",
      subscriberUsername: watcherSubscriber.username,
    },
  });

  watcherNotSubscriber = await xprisma.user.create({
    data: { username: "watcherNotSubscriber", authId: "watcherNotSubscriber" },
  });
  await xprisma.watch.create({
    data: {
      topicId: topicWithoutAllowAnyEdit.id,
      watcherUsername: watcherNotSubscriber.username,
      type: "all",
    },
  });

  notWatcherNotSubscriber = await xprisma.user.create({
    data: { username: "notWatcherNotSubscriber", authId: "notWatcherNotSubscriber" },
  });

  notWatcherIsSubscriber = await xprisma.user.create({
    data: { username: "notWatcherIsSubscriber", authId: "notWatcherIsSubscriber" },
  });
  await xprisma.subscription.create({
    data: {
      sourceId: commentWithTopicParent.id,
      sourceType: "threadStarterComment",
      subscriberUsername: notWatcherIsSubscriber.username,
    },
  });

  ignorerSubscriber = await xprisma.user.create({
    data: { username: "ignorerSubscriber", authId: "ignorerSubscriber" },
  });
  await xprisma.watch.create({
    data: {
      topicId: topicWithoutAllowAnyEdit.id,
      watcherUsername: ignorerSubscriber.username,
      type: "ignore",
    },
  });
  await xprisma.subscription.create({
    data: {
      sourceId: commentWithTopicParent.id,
      sourceType: "threadStarterComment",
      subscriberUsername: ignorerSubscriber.username,
    },
  });

  ignorerNotSubscriber = await xprisma.user.create({
    data: { username: "ignorerNotSubscriber", authId: "ignorerNotSubscriber" },
  });
  await xprisma.watch.create({
    data: {
      topicId: topicWithoutAllowAnyEdit.id,
      watcherUsername: ignorerNotSubscriber.username,
      type: "ignore",
    },
  });

  commentWithCommentParent = await xprisma.comment.create({
    data: generateComment(
      authorWatcherSubscriber,
      topicWithoutAllowAnyEdit,
      commentWithTopicParent,
      "comment"
    ),
  });
});

describe("getInAppNotificationMessage", () => {
  describe("when comment parent is comment", () => {
    test("uses 'replied' verbiage", async () => {
      const comment = await xprisma.comment.create({
        data: generateComment(
          authorWatcherSubscriber,
          topicWithoutAllowAnyEdit,
          commentWithTopicParent,
          "comment",
          "hey blah there!"
        ),
      });

      const message = getInAppNotificationMessage(comment);

      expect(message).toBe('authorWatcherSubscriber replied: "hey blah there!"');
    });
  });

  describe("when comment parent is not comment", () => {
    test("uses 'commented' verbiage", async () => {
      const comment = await xprisma.comment.create({
        data: generateComment(
          authorWatcherSubscriber,
          topicWithoutAllowAnyEdit,
          null,
          "topic",
          "hey blah there!"
        ),
      });

      const message = getInAppNotificationMessage(comment);

      expect(message).toBe('authorWatcherSubscriber commented: "hey blah there!"');
    });
  });

  describe("when comment has text that's really long", () => {
    test("return message with truncated text included", async () => {
      const comment = await xprisma.comment.create({
        data: generateComment(
          authorWatcherSubscriber,
          topicWithoutAllowAnyEdit,
          null,
          "topic",
          "This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong."
        ),
      });

      const message = getInAppNotificationMessage(comment);

      expect(message).toBe(
        'authorWatcherSubscriber commented: "This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters looooooooooooooooooooooooooo..."'
      );
    });
  });
});

const expectNotification = (
  received: InAppNotification[],
  receiver: User,
  comment: Comment,
  reason: ReasonType,
  message?: string
) => {
  if (received.length > 1) throw new Error("received more than one notification");
  const oneReceived = received[0];
  if (!oneReceived) throw new Error("did not receive notification");

  // allow this to be explicit when the test specifically cares to check it, otherwise calculate it
  const expectedMessage =
    message ??
    "authorWatcherSubscriber " +
      (comment.parentType === "comment" ? "replied: " : "commented: ") +
      `"${comment.content}"`;

  const expected: Omit<InAppNotification, "id" | "createdAt"> = {
    notifiedUsername: receiver.username,
    topicId: comment.topicId,
    type: "commentCreated",
    data: {
      commentId: comment.id,
    },
    message: expectedMessage,
    sourceUrl: `http://localhost:3000/creatorOfTopic/topicWithoutAllowAnyEdit/?comment=${comment.id}`,
    reason: reason,
  };

  const { id: _i, createdAt: _c, ...receivedWithoutGeneratedFields } = oneReceived;

  expect(receivedWithoutGeneratedFields).toEqual(expected);
};

describe("handleCommentCreated", () => {
  describe("subscribing the author", () => {
    describe("when author is already subscribed", () => {
      test("does not create a new subscription", async () => {
        const subscriptionsBefore = await xprisma.subscription.findMany({
          where: { subscriberUsername: authorWatcherSubscriber.username },
        });
        expect(subscriptionsBefore.length).toBe(1);

        await handleCommentCreated(commentWithTopicParent);

        const subscriptionsAfter = await xprisma.subscription.findMany({
          where: { subscriberUsername: authorWatcherSubscriber.username },
        });
        expect(subscriptionsAfter.length).toBe(1);
      });
    });

    describe("when author is ignoring the topic", () => {
      test("does not create a new subscription", async () => {
        const comment = generateComment(
          ignorerNotSubscriber,
          topicWithoutAllowAnyEdit,
          null,
          "topic"
        );
        await xprisma.comment.create({ data: comment });

        await handleCommentCreated(comment);

        const subscriptions = await xprisma.subscription.findMany({
          where: { subscriberUsername: ignorerNotSubscriber.username },
        });
        expect(subscriptions).toEqual([]);
      });
    });

    describe("when author is not yet subscribed, nor ignoring topic", () => {
      test("subscribes the author to the thread", async () => {
        const comment = generateComment(
          notWatcherNotSubscriber,
          topicWithoutAllowAnyEdit,
          null,
          "topic"
        );
        await xprisma.comment.create({ data: comment });

        await handleCommentCreated(comment);

        const subscriptions = await xprisma.subscription.findMany({
          where: { subscriberUsername: notWatcherNotSubscriber.username },
        });
        expect(subscriptions.length).toBe(1);

        const subscription = subscriptions[0];
        if (!subscription) throw new Error("no subscription found");
        const { id: _, ...subscriptionWithoutGeneratedFields } = subscription;

        expect(subscriptionWithoutGeneratedFields).toEqual({
          subscriberUsername: notWatcherNotSubscriber.username,
          sourceId: comment.id,
          sourceType: "threadStarterComment",
        });
      });
    });
  });

  describe("in-app notifications", () => {
    test("does not notify author", async () => {
      await handleCommentCreated(commentWithCommentParent);

      const notifications = await xprisma.inAppNotification.findMany({
        where: { notifiedUsername: authorWatcherSubscriber.username },
      });

      expect(notifications).toEqual([]);
    });

    test("does not notify ignorers", async () => {
      await handleCommentCreated(commentWithCommentParent);

      const notifications = await xprisma.inAppNotification.findMany({
        where: {
          OR: [
            { notifiedUsername: ignorerSubscriber.username },
            { notifiedUsername: ignorerNotSubscriber.username },
          ],
        },
      });

      expect(notifications).toEqual([]);
    });

    test("does not notify people who aren't watching or subscribed", async () => {
      await handleCommentCreated(commentWithCommentParent);

      const notifications = await xprisma.inAppNotification.findMany({
        where: { notifiedUsername: notWatcherNotSubscriber.username },
      });

      expect(notifications).toEqual([]);
    });

    test("notifies non-author, non-ignorer thread subscribers", async () => {
      await handleCommentCreated(commentWithCommentParent);

      const watcherSubNotifications = await xprisma.inAppNotification.findMany({
        where: { notifiedUsername: watcherSubscriber.username },
      });
      const notWatcherSubNotifications = await xprisma.inAppNotification.findMany({
        where: { notifiedUsername: notWatcherIsSubscriber.username },
      });

      expectNotification(
        watcherSubNotifications,
        watcherSubscriber,
        commentWithCommentParent,
        "subscribed"
      );
      expectNotification(
        notWatcherSubNotifications,
        notWatcherIsSubscriber,
        commentWithCommentParent,
        "subscribed"
      );
    });

    test("notifies non-author, non-ignorer, non-subscriber topic watchers", async () => {
      await handleCommentCreated(commentWithCommentParent);

      const watcherNotSubNotifications = await xprisma.inAppNotification.findMany({
        where: { notifiedUsername: watcherNotSubscriber.username },
      });

      expectNotification(
        watcherNotSubNotifications,
        watcherNotSubscriber,
        commentWithCommentParent,
        "watching"
      );
    });
  });
});
