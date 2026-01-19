/* eslint-disable functional/no-let -- let is needed to reuse `before`-initialized variables across tests */
import shortUUID from "short-uuid";
import { MockInstance, beforeEach, describe, expect, test, vi } from "vitest";

import { testEmail } from "../../../scripts/setupTests";

import * as email from "@/api/email";
import {
  getInAppNotificationMessage,
  handleCommentCreated,
} from "@/api/notifications/commentCreated";
import { Comment, CommentParent, CommentParentType } from "@/common/comment";
import { xprisma } from "@/db/extendedPrisma";
import { InAppNotification, Topic, User } from "@/db/generated/prisma/client";


let creatorOfTopic: User;
let topicWithoutAllowAnyEdit: Topic;

let author: User;
let notAuthor: User;
let notAuthorNoEmails: User;

let commentWithTopicParent: Comment;
let commentWithCommentParent: Comment;

const generateComment = (
  author: User,
  topic: Topic,
  parent: CommentParent,
  parentType: CommentParentType,
  content?: string,
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
    data: { username: "creatorOfTopic", authId: "creatorOfTopic", email: testEmail },
  });
  topicWithoutAllowAnyEdit = await xprisma.topic.create({
    data: {
      title: "topicWithoutAllowAnyEdit",
      creatorName: creatorOfTopic.username,
      visibility: "public",
      allowAnyoneToEdit: false,
    },
  });

  author = await xprisma.user.create({
    data: { username: "author", authId: "author", email: testEmail },
  });
  notAuthor = await xprisma.user.create({
    data: { username: "notAuthor", authId: "notAuthor", email: testEmail },
  });
  notAuthorNoEmails = await xprisma.user.create({
    data: {
      username: "notAuthorNoEmails",
      authId: "notAuthorNoEmails",
      email: testEmail,
      receiveEmailNotifications: false,
    },
  });

  commentWithTopicParent = await xprisma.comment.create({
    data: generateComment(author, topicWithoutAllowAnyEdit, null, "topic"),
  });
  commentWithCommentParent = await xprisma.comment.create({
    data: generateComment(author, topicWithoutAllowAnyEdit, commentWithTopicParent, "comment"),
  });
});

describe("getInAppNotificationMessage", () => {
  describe("when comment parent is comment", () => {
    test("uses 'replied' verbiage", async () => {
      const comment = await xprisma.comment.create({
        data: generateComment(
          author,
          topicWithoutAllowAnyEdit,
          commentWithTopicParent,
          "comment",
          "hey blah there!",
        ),
      });

      const message = getInAppNotificationMessage(comment);

      expect(message).toBe('author replied: "hey blah there!"');
    });
  });

  describe("when comment parent is not comment", () => {
    test("uses 'commented' verbiage", async () => {
      const comment = await xprisma.comment.create({
        data: generateComment(author, topicWithoutAllowAnyEdit, null, "topic", "hey blah there!"),
      });

      const message = getInAppNotificationMessage(comment);

      expect(message).toBe('author commented: "hey blah there!"');
    });
  });

  describe("when comment has text that's really long", () => {
    test("return message with truncated text included", async () => {
      const comment = await xprisma.comment.create({
        data: generateComment(
          author,
          topicWithoutAllowAnyEdit,
          null,
          "topic",
          "This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.",
        ),
      });

      const message = getInAppNotificationMessage(comment);

      expect(message).toBe(
        'author commented: "This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.This sentence is 100 characters loooooooooooooooooooooooooooooooooooooooooooo..."',
      );
    });
  });
});

const expectNotification = (
  received: InAppNotification[],
  receiver: User,
  comment: Comment,
  message?: string,
) => {
  if (received.length > 1) throw new Error("received more than one notification");
  const oneReceived = received[0];
  if (!oneReceived) throw new Error("did not receive notification");

  // allow this to be explicit when the test specifically cares to check it, otherwise calculate it
  const expectedMessage =
    message ??
    "author " +
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
    sourceUrl: `http://localhost:3000/creatorOfTopic/topicWithoutAllowAnyEdit?comment=${comment.id}`,
  };

  const { id: _i, createdAt: _c, ...receivedWithoutGeneratedFields } = oneReceived;

  expect(receivedWithoutGeneratedFields).toEqual(expected);
};

describe("handleCommentCreated", () => {
  describe("subscription creation", () => {
    describe("when comment is thread-starter", () => {
      describe("when user is not author and is not watching for all notifications for the topic", () => {
        test("does not create a new subscription for the user", async () => {
          await handleCommentCreated(commentWithTopicParent);

          const subscriptionsAfter = await xprisma.subscription.findMany({
            where: { subscriberUsername: notAuthor.username },
          });
          expect(subscriptionsAfter.length).toBe(0);
        });
      });

      describe("when user is not author but is watching for all notifications for the topic", () => {
        test("creates a new subscription for the user", async () => {
          await xprisma.watch.create({
            data: {
              watcherUsername: notAuthor.username,
              topicId: commentWithTopicParent.topicId,
              type: "all",
            },
          });

          await handleCommentCreated(commentWithTopicParent);

          const subscriptionsAfter = await xprisma.subscription.findMany({
            where: { subscriberUsername: notAuthor.username },
          });
          expect(subscriptionsAfter.length).toBe(1);
        });
      });

      describe("when user is author but is ignoring the topic", () => {
        test("does not create a new subscription for the user", async () => {
          await xprisma.watch.create({
            data: {
              watcherUsername: author.username,
              topicId: commentWithTopicParent.topicId,
              type: "ignore",
            },
          });

          await handleCommentCreated(commentWithTopicParent);

          const subscriptionsAfter = await xprisma.subscription.findMany({
            where: { subscriberUsername: author.username },
          });
          expect(subscriptionsAfter.length).toBe(0);
        });
      });

      describe("when user is author and is not ignoring the topic", () => {
        test("creates a new subscription for the user", async () => {
          await handleCommentCreated(commentWithTopicParent);

          const subscriptionsAfter = await xprisma.subscription.findMany({
            where: { subscriberUsername: author.username },
          });
          expect(subscriptionsAfter.length).toBe(1);
        });
      });
    });

    describe("when comment is a reply", () => {
      describe("when user is already subscribed", () => {
        test("does not create a new subscription for the user", async () => {
          await xprisma.subscription.create({
            data: {
              subscriberUsername: author.username,
              sourceId: commentWithTopicParent.id,
              sourceType: "threadStarterComment",
            },
          });

          await handleCommentCreated(commentWithCommentParent);

          const subscriptionsAfter = await xprisma.subscription.findMany({
            where: { subscriberUsername: author.username },
          });
          expect(subscriptionsAfter.length).toBe(1);
        });
      });

      describe("when user is ignoring the topic", () => {
        test("does not create a new subscription for the user", async () => {
          await xprisma.watch.create({
            data: {
              watcherUsername: author.username,
              topicId: commentWithCommentParent.topicId,
              type: "ignore",
            },
          });

          await handleCommentCreated(commentWithCommentParent);

          const subscriptionsAfter = await xprisma.subscription.findMany({
            where: { subscriberUsername: author.username },
          });
          expect(subscriptionsAfter.length).toBe(0);
        });
      });

      describe("when user is not the author", () => {
        test("does not create a new subscription for the user, even if watching the topic", async () => {
          await xprisma.watch.create({
            data: {
              watcherUsername: notAuthor.username,
              topicId: commentWithCommentParent.topicId,
              type: "all",
            },
          });

          await handleCommentCreated(commentWithCommentParent);

          const subscriptionsAfter = await xprisma.subscription.findMany({
            where: { subscriberUsername: notAuthor.username },
          });
          expect(subscriptionsAfter.length).toBe(0);
        });
      });

      describe("when user is not subscribed, is not ignoring, and is the author", () => {
        test("creates a new subscription for the user", async () => {
          await handleCommentCreated(commentWithCommentParent);

          const subscriptionsAfter = await xprisma.subscription.findMany({
            where: { subscriberUsername: author.username },
          });
          expect(subscriptionsAfter.length).toBe(1);

          const subscription = subscriptionsAfter[0];
          if (!subscription) throw new Error("no subscription found");
          const { id: _, ...subscriptionWithoutGeneratedFields } = subscription;

          expect(subscriptionWithoutGeneratedFields).toEqual({
            subscriberUsername: author.username,
            sourceId: commentWithCommentParent.parentId,
            sourceType: "threadStarterComment",
          });
        });
      });
    });
  });

  describe("in-app notifications", () => {
    test("does not notify the author, even if subscribed", async () => {
      await xprisma.subscription.create({
        data: {
          subscriberUsername: author.username,
          sourceId: commentWithTopicParent.id,
          sourceType: "threadStarterComment",
        },
      });

      await handleCommentCreated(commentWithCommentParent);

      const notifications = await xprisma.inAppNotification.findMany({
        where: { notifiedUsername: author.username },
      });

      expect(notifications).toEqual([]);
    });

    test("does not notify users that were not already subscribed, and are not subscribed by the comment's creation", async () => {
      await handleCommentCreated(commentWithCommentParent);

      const notifications = await xprisma.inAppNotification.findMany({
        where: { notifiedUsername: notAuthor.username },
      });

      expect(notifications).toEqual([]);
    });

    test("notifies users that were already subscribed", async () => {
      await xprisma.subscription.create({
        data: {
          subscriberUsername: notAuthor.username,
          sourceId: commentWithTopicParent.id,
          sourceType: "threadStarterComment",
        },
      });

      await handleCommentCreated(commentWithCommentParent);

      const notifications = await xprisma.inAppNotification.findMany({
        where: { notifiedUsername: notAuthor.username },
      });

      expectNotification(notifications, notAuthor, commentWithCommentParent);
    });

    test("notifies users that are subscribed by the comment's creation", async () => {
      await xprisma.watch.create({
        data: {
          watcherUsername: notAuthor.username,
          topicId: commentWithTopicParent.topicId,
          type: "all",
        },
      });

      await handleCommentCreated(commentWithTopicParent);

      const notifications = await xprisma.inAppNotification.findMany({
        where: { notifiedUsername: notAuthor.username },
      });

      expectNotification(notifications, notAuthor, commentWithTopicParent);
    });
  });

  describe("email notifications", () => {
    let sendAllEmailsSpy: MockInstance;

    beforeEach(() => {
      sendAllEmailsSpy = vi.spyOn(email, "sendAllEmails");
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      sendAllEmailsSpy.mockImplementation(() => {});
    });

    describe("when sendgrid isn't set up to send emails", () => {
      beforeEach(() => {
        const canSendEmailsSpy = vi.spyOn(email, "canSendEmails");
        canSendEmailsSpy.mockImplementation(() => false);
      });

      test("does not send emails", async () => {
        await handleCommentCreated(commentWithCommentParent);

        expect(sendAllEmailsSpy).not.toHaveBeenCalled();
      });
    });

    describe("when sendgrid is set up to send emails", () => {
      beforeEach(() => {
        const canSendEmailsSpy = vi.spyOn(email, "canSendEmails");
        canSendEmailsSpy.mockImplementation(() => true);
      });

      test("does not send emails to users that have emails turned off, even if they're subscribed", async () => {
        await xprisma.subscription.create({
          data: {
            subscriberUsername: notAuthorNoEmails.username,
            sourceId: commentWithTopicParent.id,
            sourceType: "threadStarterComment",
          },
        });

        await handleCommentCreated(commentWithCommentParent);

        expect(sendAllEmailsSpy).toHaveBeenCalledWith([]);
      });

      test("does not send emails to author, even if they're subscribed", async () => {
        await xprisma.subscription.create({
          data: {
            subscriberUsername: author.username,
            sourceId: commentWithTopicParent.id,
            sourceType: "threadStarterComment",
          },
        });

        await handleCommentCreated(commentWithCommentParent);

        expect(sendAllEmailsSpy).toHaveBeenCalledWith([]);
      });

      test("does not send emails to users that are not already subscribed, and are not subscribed by the comment's creation", async () => {
        await handleCommentCreated(commentWithCommentParent);

        expect(sendAllEmailsSpy).toHaveBeenCalledWith([]);
      });

      test("sends emails to users that were already subscribed", async () => {
        await xprisma.subscription.create({
          data: {
            subscriberUsername: notAuthor.username,
            sourceId: commentWithTopicParent.id,
            sourceType: "threadStarterComment",
          },
        });

        await handleCommentCreated(commentWithCommentParent);

        const unsubscribeThreadCode = await xprisma.unsubscribeCode.findFirstOrThrow({
          where: {
            subscriberUsername: notAuthor.username,
            subscriptionSourceId: commentWithTopicParent.id,
            subscriptionSourceType: "threadStarterComment",
          },
        });

        const unsubscribeAllCode = await xprisma.unsubscribeCode.findFirstOrThrow({
          where: {
            subscriberUsername: notAuthor.username,
            subscriptionSourceId: null,
            subscriptionSourceType: null,
          },
        });

        expect(sendAllEmailsSpy).toHaveBeenCalledWith([
          {
            fromName: "author",
            to: notAuthor.email,
            subject: "Re: creatorOfTopic/topicWithoutAllowAnyEdit",
            html: `<div style="white-space: pre;">${commentWithCommentParent.content}
—
<a href="http://localhost:3000/creatorOfTopic/topicWithoutAllowAnyEdit?comment=${commentWithCommentParent.id}">View comment on Ameliorate</a>.

<a href="http://localhost:3000/unsubscribe/${unsubscribeThreadCode.code}">Unsubscribe from thread</a> | <a href="http://localhost:3000/unsubscribe/${unsubscribeAllCode.code}">Unsubscribe from all Ameliorate notification emails</a>.
</div>`,
          },
        ]);
      });

      test("sends emails to users that are subscribed by the comment's creation", async () => {
        await xprisma.watch.create({
          data: {
            watcherUsername: notAuthor.username,
            topicId: commentWithTopicParent.topicId,
            type: "all",
          },
        });

        await handleCommentCreated(commentWithTopicParent);

        const unsubscribeThreadCode = await xprisma.unsubscribeCode.findFirstOrThrow({
          where: {
            subscriberUsername: notAuthor.username,
            subscriptionSourceId: commentWithTopicParent.id,
            subscriptionSourceType: "threadStarterComment",
          },
        });

        const unsubscribeAllCode = await xprisma.unsubscribeCode.findFirstOrThrow({
          where: {
            subscriberUsername: notAuthor.username,
            subscriptionSourceId: null,
            subscriptionSourceType: null,
          },
        });

        expect(sendAllEmailsSpy).toHaveBeenCalledWith([
          {
            fromName: "author",
            to: notAuthor.email,
            subject: "Re: creatorOfTopic/topicWithoutAllowAnyEdit",
            html: `<div style="white-space: pre;">${commentWithTopicParent.content}
—
<a href="http://localhost:3000/creatorOfTopic/topicWithoutAllowAnyEdit?comment=${commentWithTopicParent.id}">View comment on Ameliorate</a>.

<a href="http://localhost:3000/unsubscribe/${unsubscribeThreadCode.code}">Unsubscribe from thread</a> | <a href="http://localhost:3000/unsubscribe/${unsubscribeAllCode.code}">Unsubscribe from all Ameliorate notification emails</a>.
</div>`,
          },
        ]);
      });
    });
  });
});
