/* eslint-disable functional/no-let -- let is needed to reuse `before`-initialized variables across tests */
import { Topic, User } from "@prisma/client";
import shortUUID from "short-uuid";
import { beforeEach, describe, expect, test, vi } from "vitest";

import * as commentCreated from "@/api/notifications/commentCreated";
import { appRouter } from "@/api/routers/_app";
import { Comment } from "@/common/comment";
import { xprisma } from "@/db/extendedPrisma";

import { testEmail } from "../../../scripts/setupTests";

let creatorOfTopic: User;
let notCreatorOfTopic: User;
let notCreatorOrAuthor: User;
let topicWithoutAllowAnyEdit: Topic;
let otherTopic: Topic;
let rootCommentByTopicCreator: Comment;
let childOfCreatorByNotTopicCreator: Comment;
let rootCommentByNotTopicCreator: Comment;
let childOfNotCreatorByCreator: Comment;

const generateComment = (author: User, topic: Topic, rootComment?: Comment): Comment => {
  const time = new Date();
  const isChildComment = rootComment !== undefined;

  return {
    id: shortUUID.generate(),
    authorName: author.username,
    topicId: topic.id,
    parentId: isChildComment ? rootComment.id : null,
    parentType: isChildComment ? "comment" : "topic",
    content: "blah",
    resolved: isChildComment ? null : false,
    createdAt: time,
    contentUpdatedAt: time,
  };
};

beforeEach(async () => {
  creatorOfTopic = await xprisma.user.create({
    data: { username: "creatorOfTopic", authId: "creatorOfTopic", email: testEmail },
  });
  notCreatorOfTopic = await xprisma.user.create({
    data: { username: "notCreatorOfTopic", authId: "notCreatorOfTopic", email: testEmail },
  });
  notCreatorOrAuthor = await xprisma.user.create({
    data: { username: "notCreatorOrAuthor", authId: "notCreatorOrAuthor", email: testEmail },
  });

  topicWithoutAllowAnyEdit = await xprisma.topic.create({
    data: {
      title: "topicWithoutAllowAnyEdit",
      creatorName: creatorOfTopic.username,
      visibility: "public",
      allowAnyoneToEdit: false,
    },
  });

  otherTopic = await xprisma.topic.create({
    data: {
      title: "otherTopic",
      creatorName: creatorOfTopic.username,
      visibility: "public",
      allowAnyoneToEdit: false,
    },
  });

  rootCommentByTopicCreator = await xprisma.comment.create({
    data: generateComment(creatorOfTopic, topicWithoutAllowAnyEdit),
  });

  childOfCreatorByNotTopicCreator = await xprisma.comment.create({
    data: generateComment(notCreatorOfTopic, topicWithoutAllowAnyEdit, rootCommentByTopicCreator),
  });

  rootCommentByNotTopicCreator = await xprisma.comment.create({
    data: generateComment(notCreatorOfTopic, topicWithoutAllowAnyEdit),
  });

  childOfNotCreatorByCreator = await xprisma.comment.create({
    data: generateComment(creatorOfTopic, topicWithoutAllowAnyEdit, rootCommentByNotTopicCreator),
  });
});

describe("handleChangesets", () => {
  describe("when user is author of comment", () => {
    test("can CRUD own comments", async () => {
      const trpc = appRouter.createCaller({
        userAuthId: notCreatorOfTopic.authId,
        userEmailVerified: true,
        user: notCreatorOfTopic,
      });

      const newComment = generateComment(notCreatorOfTopic, topicWithoutAllowAnyEdit);
      const updatedComment = { ...rootCommentByNotTopicCreator, content: "updated" };
      const deletedComment = childOfCreatorByNotTopicCreator;

      await trpc.comment.handleChangesets({
        topicId: topicWithoutAllowAnyEdit.id,
        commentsToCreate: [newComment],
        commentsToUpdate: [updatedComment],
        commentsToDelete: [deletedComment],
      });

      const created = await xprisma.comment.findFirstOrThrow({ where: { id: newComment.id } });
      const updated = await xprisma.comment.findFirstOrThrow({ where: { id: updatedComment.id } });
      const deleted = await xprisma.comment.findFirst({ where: { id: deletedComment.id } });

      expect(created).toStrictEqual(newComment);
      expect(updated).toStrictEqual(updatedComment);
      expect(deleted).toBeNull();
    });

    describe("when deleting own root comment", () => {
      test("can delete others' child comments", async () => {
        const trpc = appRouter.createCaller({
          userAuthId: notCreatorOfTopic.authId,
          userEmailVerified: true,
          user: notCreatorOfTopic,
        });

        const rootToDelete = rootCommentByNotTopicCreator;
        const childToDelete = childOfNotCreatorByCreator;

        await trpc.comment.handleChangesets({
          topicId: topicWithoutAllowAnyEdit.id,
          commentsToCreate: [],
          commentsToUpdate: [],
          commentsToDelete: [rootToDelete, childToDelete],
        });

        const deletedRoot = await xprisma.comment.findFirst({ where: { id: rootToDelete.id } });
        const deletedChild = await xprisma.comment.findFirst({ where: { id: childToDelete.id } });

        expect(deletedRoot).toBeNull();
        expect(deletedChild).toBeNull();
      });
    });

    test("cannot CRUD comments from different topics", async () => {
      const trpc = appRouter.createCaller({
        userAuthId: notCreatorOfTopic.authId,
        userEmailVerified: true,
        user: notCreatorOfTopic,
      });

      const newComment = generateComment(notCreatorOfTopic, topicWithoutAllowAnyEdit);
      const newOtherComment = generateComment(notCreatorOfTopic, otherTopic);

      await expect(
        async () =>
          await trpc.comment.handleChangesets({
            topicId: topicWithoutAllowAnyEdit.id,
            commentsToCreate: [newComment, newOtherComment],
            commentsToUpdate: [],
            commentsToDelete: [],
          }),
      ).rejects.toThrow();
    });
  });

  describe("when user is not author of comment", () => {
    describe("when user can edit topic", () => {
      test("can resolve others' comments", async () => {
        const trpc = appRouter.createCaller({
          userAuthId: creatorOfTopic.authId,
          userEmailVerified: true,
          user: creatorOfTopic,
        });

        const commentToResolve = { ...rootCommentByNotTopicCreator, resolved: true };

        await trpc.comment.handleChangesets({
          topicId: topicWithoutAllowAnyEdit.id,
          commentsToCreate: [],
          commentsToUpdate: [commentToResolve],
          commentsToDelete: [],
        });

        const resolved = await xprisma.comment.findFirst({ where: { id: commentToResolve.id } });
        expect(resolved).toStrictEqual(commentToResolve);
      });

      test("can delete others' comments", async () => {
        const trpc = appRouter.createCaller({
          userAuthId: creatorOfTopic.authId,
          userEmailVerified: true,
          user: creatorOfTopic,
        });

        const deletedComment = childOfCreatorByNotTopicCreator;

        await trpc.comment.handleChangesets({
          topicId: topicWithoutAllowAnyEdit.id,
          commentsToCreate: [],
          commentsToUpdate: [],
          commentsToDelete: [deletedComment],
        });

        const deleted = await xprisma.comment.findFirst({ where: { id: deletedComment.id } });
        expect(deleted).toBeNull();
      });

      test("cannot create or update others' comments", async () => {
        const trpc = appRouter.createCaller({
          userAuthId: creatorOfTopic.authId,
          userEmailVerified: true,
          user: creatorOfTopic,
        });

        const newComment = generateComment(notCreatorOfTopic, topicWithoutAllowAnyEdit);
        const updatedComment = { ...childOfCreatorByNotTopicCreator, content: "updated" };

        await expect(
          async () =>
            await trpc.comment.handleChangesets({
              topicId: topicWithoutAllowAnyEdit.id,
              commentsToCreate: [newComment],
              commentsToUpdate: [],
              commentsToDelete: [],
            }),
        ).rejects.toThrow();

        await expect(
          async () =>
            await trpc.comment.handleChangesets({
              topicId: topicWithoutAllowAnyEdit.id,
              commentsToCreate: [],
              commentsToUpdate: [updatedComment],
              commentsToDelete: [],
            }),
        ).rejects.toThrow();
      });
    });

    describe("when user cannot edit topic", () => {
      test("cannot CRUD others' comments", async () => {
        const trpc = appRouter.createCaller({
          userAuthId: notCreatorOrAuthor.authId,
          userEmailVerified: true,
          user: notCreatorOrAuthor,
        });

        const newComment = generateComment(notCreatorOfTopic, topicWithoutAllowAnyEdit);
        const updatedComment = { ...childOfCreatorByNotTopicCreator, content: "updated" };
        const resolvedComment = { ...rootCommentByNotTopicCreator, resolved: true };
        const deletedComment = childOfCreatorByNotTopicCreator;

        await expect(
          async () =>
            await trpc.comment.handleChangesets({
              topicId: topicWithoutAllowAnyEdit.id,
              commentsToCreate: [newComment],
              commentsToUpdate: [],
              commentsToDelete: [],
            }),
        ).rejects.toThrow();

        await expect(
          async () =>
            await trpc.comment.handleChangesets({
              topicId: topicWithoutAllowAnyEdit.id,
              commentsToCreate: [],
              commentsToUpdate: [updatedComment],
              commentsToDelete: [],
            }),
        ).rejects.toThrow();

        await expect(
          async () =>
            await trpc.comment.handleChangesets({
              topicId: topicWithoutAllowAnyEdit.id,
              commentsToCreate: [],
              commentsToUpdate: [resolvedComment],
              commentsToDelete: [],
            }),
        ).rejects.toThrow();

        await expect(
          async () =>
            await trpc.comment.handleChangesets({
              topicId: topicWithoutAllowAnyEdit.id,
              commentsToCreate: [],
              commentsToUpdate: [],
              commentsToDelete: [deletedComment],
            }),
        ).rejects.toThrow();
      });
    });
  });

  describe("when a comment is created", () => {
    let watcher: User;

    beforeEach(async () => {
      watcher = await xprisma.user.create({
        data: { username: "watcher", authId: "watcher", email: testEmail },
      });
      await xprisma.watch.create({
        data: {
          topicId: topicWithoutAllowAnyEdit.id,
          watcherUsername: watcher.username,
          type: "all",
        },
      });
    });

    // a simple notification test is here as one api-to-end test
    test("creates subscriptions and notifications", async () => {
      const trpc = appRouter.createCaller({
        userAuthId: notCreatorOfTopic.authId,
        userEmailVerified: true,
        user: notCreatorOfTopic,
      });

      const newComment = generateComment(notCreatorOfTopic, topicWithoutAllowAnyEdit);

      await trpc.comment.handleChangesets({
        topicId: topicWithoutAllowAnyEdit.id,
        commentsToCreate: [newComment],
        commentsToUpdate: [],
        commentsToDelete: [],
      });

      const subscriptions = await xprisma.subscription.findMany({
        where: { subscriberUsername: watcher.username, sourceId: newComment.id },
      });
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0]).toMatchObject({
        subscriberUsername: watcher.username,
        sourceId: newComment.id,
        sourceType: "threadStarterComment",
      });

      const notifications = await xprisma.inAppNotification.findMany({
        where: { notifiedUsername: watcher.username },
      });
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject({
        notifiedUsername: watcher.username,
        topicId: newComment.topicId,
        type: "commentCreated",
        data: {
          commentId: newComment.id,
        },
        message: notCreatorOfTopic.username + ` commented: "${newComment.content}"`,
        sourceUrl: `http://localhost:3000/creatorOfTopic/topicWithoutAllowAnyEdit?comment=${newComment.id}`,
      });
    });

    // assert that handleCommentCreated is invoked so that more comprehensive notification
    // tests can be extracted to another more-focused file.
    test("invokes handleCommentCreated", async () => {
      const handleCommentCreatedSpy = vi.spyOn(commentCreated, "handleCommentCreated");

      const trpc = appRouter.createCaller({
        userAuthId: notCreatorOfTopic.authId,
        userEmailVerified: true,
        user: notCreatorOfTopic,
      });

      const newComment = generateComment(notCreatorOfTopic, topicWithoutAllowAnyEdit);

      await trpc.comment.handleChangesets({
        topicId: topicWithoutAllowAnyEdit.id,
        commentsToCreate: [newComment],
        commentsToUpdate: [],
        commentsToDelete: [],
      });

      expect(handleCommentCreatedSpy).toHaveBeenCalledOnce();
      expect(handleCommentCreatedSpy).toHaveBeenCalledWith(newComment);
    });
  });
});
