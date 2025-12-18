/* eslint-disable functional/no-let -- let is needed to reuse `before`-initialized variables across tests */
import shortUUID from "short-uuid";
import { beforeEach, describe, expect, test } from "vitest";

import { createCaller } from "@/api/routers/_app";
import { QuickView } from "@/common/view";
import { xprisma } from "@/db/extendedPrisma";
import { Topic, User } from "@/db/generated/prisma/client";

import { testEmail } from "../../../scripts/setupTests";

let creatorOfTopic: User;
let notCreatorOfTopic: User;
let topicWithoutAllowAnyEdit: Topic;
let otherTopic: Topic;
let quickView1: QuickView;
let quickView2: QuickView;

const generateView = (title: string, order: number, topic: Topic): QuickView => {
  return {
    id: shortUUID.generate(),
    topicId: topic.id,
    type: "quick",
    title: title,
    order: order,
    viewState: {},
  };
};

beforeEach(async () => {
  creatorOfTopic = await xprisma.user.create({
    data: { username: "creatorOfTopic", authId: "creatorOfTopic", email: testEmail },
  });
  notCreatorOfTopic = await xprisma.user.create({
    data: { username: "notCreatorOfTopic", authId: "notCreatorOfTopic", email: testEmail },
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

  quickView1 = (await xprisma.view.create({
    data: generateView("quickView1", 0, topicWithoutAllowAnyEdit),
  })) as QuickView;
  quickView2 = (await xprisma.view.create({
    data: generateView("quickView2", 1, topicWithoutAllowAnyEdit),
  })) as QuickView;
});

describe("handleChangesets", () => {
  describe("when user can edit topic", () => {
    test("can CRUD views", async () => {
      const trpc = createCaller({
        userAuthId: creatorOfTopic.authId,
        userEmailVerified: true,
        user: creatorOfTopic,
      });

      const newView = generateView("newView", 2, topicWithoutAllowAnyEdit);
      const updatedView = { ...quickView1, title: "updated" };
      const deletedView = quickView2;

      await trpc.view.handleChangesets({
        topicId: topicWithoutAllowAnyEdit.id,
        viewsToCreate: [newView],
        viewsToUpdate: [updatedView],
        viewsToDelete: [deletedView],
      });

      const {
        createdAt: _c,
        updatedAt: _u,
        ...createdWithoutTimeFields
      } = await xprisma.view.findFirstOrThrow({ where: { id: newView.id } });

      const updated = await xprisma.view.findFirstOrThrow({ where: { id: updatedView.id } });
      const deleted = await xprisma.view.findFirst({ where: { id: deletedView.id } });

      expect(createdWithoutTimeFields).toStrictEqual(newView);
      expect(updated).toStrictEqual(updatedView);
      expect(deleted).toBeNull();
    });

    test("can create a new view with the same title as a view being deleted", async () => {
      // e.g. when uploading a topic

      const trpc = createCaller({
        userAuthId: creatorOfTopic.authId,
        userEmailVerified: true,
        user: creatorOfTopic,
      });

      const newView = generateView(quickView1.title, 2, topicWithoutAllowAnyEdit);
      const deletedView = quickView1;

      await trpc.view.handleChangesets({
        topicId: topicWithoutAllowAnyEdit.id,
        viewsToCreate: [newView],
        viewsToUpdate: [],
        viewsToDelete: [deletedView],
      });

      const {
        createdAt: _c,
        updatedAt: _u,
        ...createdWithoutTimeFields
      } = await xprisma.view.findFirstOrThrow({ where: { id: newView.id } });
      const deleted = await xprisma.view.findFirst({ where: { id: deletedView.id } });

      expect(createdWithoutTimeFields).toStrictEqual(newView);
      expect(deleted).toBeNull();
    });

    test("cannot CRUD views from different topics", async () => {
      const trpc = createCaller({
        userAuthId: creatorOfTopic.authId,
        userEmailVerified: true,
        user: creatorOfTopic,
      });

      const newView1 = generateView("newView1", 2, topicWithoutAllowAnyEdit);
      const newView2 = generateView("newView2", 3, otherTopic);

      await expect(
        async () =>
          await trpc.view.handleChangesets({
            topicId: topicWithoutAllowAnyEdit.id,
            viewsToCreate: [newView1, newView2],
            viewsToUpdate: [],
            viewsToDelete: [],
          }),
      ).rejects.toThrow();
    });
  });

  describe("when user cannot edit topic", () => {
    test("cannot CRUD views", async () => {
      const trpc = createCaller({
        userAuthId: notCreatorOfTopic.authId,
        userEmailVerified: true,
        user: notCreatorOfTopic,
      });

      const newView = generateView("newView", 2, topicWithoutAllowAnyEdit);
      const updatedView = { ...quickView1, title: "updated" };
      const deletedView = quickView2;

      await expect(
        async () =>
          await trpc.view.handleChangesets({
            topicId: topicWithoutAllowAnyEdit.id,
            viewsToCreate: [newView],
            viewsToUpdate: [],
            viewsToDelete: [],
          }),
      ).rejects.toThrow();

      await expect(
        async () =>
          await trpc.view.handleChangesets({
            topicId: topicWithoutAllowAnyEdit.id,
            viewsToCreate: [],
            viewsToUpdate: [updatedView],
            viewsToDelete: [],
          }),
      ).rejects.toThrow();

      await expect(
        async () =>
          await trpc.view.handleChangesets({
            topicId: topicWithoutAllowAnyEdit.id,
            viewsToCreate: [],
            viewsToUpdate: [],
            viewsToDelete: [deletedView],
          }),
      ).rejects.toThrow();
    });
  });
});
