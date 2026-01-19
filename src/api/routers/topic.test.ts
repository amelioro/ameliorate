/* eslint-disable functional/no-let -- let is needed to reuse `before`-initialized variables across tests */
import { v4 as uuid } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

import { testEmail } from "../../../scripts/setupTests";

import { createCaller } from "@/api/routers/_app";
import { xprisma } from "@/db/extendedPrisma";
import { Topic, User } from "@/db/generated/prisma/client";


let userWithTopics: User;
let otherUser: User;
let publicTopic: Topic;
let unlistedTopic: Topic;
let privateTopic: Topic;
let topicWithoutAllowAnyEdit: Topic;
let topicWithAllowAnyEdit: Topic;

beforeEach(async () => {
  userWithTopics = await xprisma.user.create({
    data: { username: "hasTopicsName", authId: "hasTopicsAuth", email: testEmail },
  });
  otherUser = await xprisma.user.create({
    data: { username: "otherUser", authId: "otherUser", email: testEmail },
  });
  publicTopic = await xprisma.topic.create({
    data: {
      title: "publicTopic",
      creatorName: userWithTopics.username,
      visibility: "public",
    },
  });

  unlistedTopic = await xprisma.topic.create({
    data: {
      title: "unlistedTopic",
      creatorName: userWithTopics.username,
      visibility: "unlisted",
    },
  });

  privateTopic = await xprisma.topic.create({
    data: {
      title: "privateTopic",
      creatorName: userWithTopics.username,
      visibility: "private",
    },
  });

  topicWithoutAllowAnyEdit = await xprisma.topic.create({
    data: {
      title: "topicWithoutAllowAnyEdit",
      creatorName: userWithTopics.username,
      visibility: "public",
      allowAnyoneToEdit: false,
    },
  });

  topicWithAllowAnyEdit = await xprisma.topic.create({
    data: {
      title: "topicWithAllowAnyEdit",
      creatorName: userWithTopics.username,
      visibility: "public",
      allowAnyoneToEdit: true,
    },
  });
});

describe("findByUsernameAndTitle", () => {
  describe("when viewing your own topic", () => {
    test("can view private topic", async () => {
      const trpc = createCaller({
        userAuthId: userWithTopics.authId,
        userEmailVerified: true,
        user: userWithTopics,
      });

      const topic = await trpc.topic.findByUsernameAndTitle({
        username: userWithTopics.username,
        title: privateTopic.title,
      });

      expect(topic).toStrictEqual(privateTopic);
    });
  });

  describe("when viewing someone else's topic", () => {
    test("can view public topic", async () => {
      const trpc = createCaller({});

      const topic = await trpc.topic.findByUsernameAndTitle({
        username: userWithTopics.username,
        title: publicTopic.title,
      });

      expect(topic).toStrictEqual(publicTopic);
    });

    test("can view unlisted topic", async () => {
      const trpc = createCaller({});

      const topic = await trpc.topic.findByUsernameAndTitle({
        username: userWithTopics.username,
        title: unlistedTopic.title,
      });

      expect(topic).toStrictEqual(unlistedTopic);
    });

    test("cannot view private topic", async () => {
      const trpc = createCaller({});

      const topic = await trpc.topic.findByUsernameAndTitle({
        username: userWithTopics.username,
        title: privateTopic.title,
      });

      expect(topic).toBeNull();
    });
  });
});

describe("getData", () => {
  describe("when viewing your own topic", () => {
    test("can view private topic", async () => {
      const trpc = createCaller({
        userAuthId: userWithTopics.authId,
        userEmailVerified: true,
        user: userWithTopics,
      });

      const topic = await trpc.topic.getData({
        username: userWithTopics.username,
        title: privateTopic.title,
      });

      expect(topic?.id).toBe(privateTopic.id);
    });
  });

  describe("when viewing someone else's topic", () => {
    test("can view public topic", async () => {
      const trpc = createCaller({});

      const topic = await trpc.topic.getData({
        username: userWithTopics.username,
        title: publicTopic.title,
      });

      expect(topic?.id).toBe(publicTopic.id);
    });

    test("can view unlisted topic", async () => {
      const trpc = createCaller({});

      const topic = await trpc.topic.getData({
        username: userWithTopics.username,
        title: unlistedTopic.title,
      });

      expect(topic?.id).toBe(unlistedTopic.id);
    });

    test("cannot view private topic", async () => {
      const trpc = createCaller({});

      const topic = await trpc.topic.getData({
        username: userWithTopics.username,
        title: privateTopic.title,
      });

      expect(topic).toBeNull();
    });
  });
});

describe("setData", () => {
  const tryUpdateTopic = async (loggedInUser: User | null, topic: Topic) => {
    const trpc = createCaller(
      loggedInUser
        ? {
            userAuthId: loggedInUser.authId,
            userEmailVerified: true,
            user: loggedInUser,
          }
        : {},
    );

    await trpc.topic.updateDiagram({
      topicId: topic.id,
      nodesToCreate: [
        {
          type: "problem",
          id: uuid(),
          text: "yep",
          topicId: topic.id,
          arguedDiagramPartId: null,
          customType: null,
          notes: "",
        },
      ],
      nodesToUpdate: [],
      nodesToDelete: [],
      edgesToCreate: [],
      edgesToUpdate: [],
      edgesToDelete: [],
      scoresToCreate: [],
      scoresToUpdate: [],
      scoresToDelete: [],
    });
  };

  describe("when user is creator", () => {
    test("can update topic", async () => {
      await expect(tryUpdateTopic(userWithTopics, topicWithoutAllowAnyEdit)).resolves.not.toThrow();
    });
  });

  describe("when user is logged in, but not creator", () => {
    describe("when topic allows edit by anyone", () => {
      test("can update topic", async () => {
        await expect(tryUpdateTopic(otherUser, topicWithAllowAnyEdit)).resolves.not.toThrow();
      });
    });

    describe("when topic does not allow edit by anyone", () => {
      test("cannot update topic", async () => {
        await expect(tryUpdateTopic(otherUser, topicWithoutAllowAnyEdit)).rejects.toThrow();
      });
    });
  });

  describe("when user is not logged in", () => {
    test("cannot update topic", async () => {
      await expect(tryUpdateTopic(null, topicWithAllowAnyEdit)).rejects.toThrow();
    });
  });
});

describe("create", () => {
  test("creates a watch on the topic for the creator", async () => {
    const trpc = createCaller({
      userAuthId: userWithTopics.authId,
      userEmailVerified: true,
      user: userWithTopics,
    });

    const topic = await trpc.topic.create({
      topic: {
        title: "newTopic",
        description: "",
        visibility: "public",
        allowAnyoneToEdit: false,
      },
      quickViews: [],
    });

    const watches = await xprisma.watch.findMany({
      where: { watcherUsername: userWithTopics.username, topicId: topic.id },
    });

    expect(watches).toHaveLength(1);
    expect(watches[0]).toMatchObject({
      watcherUsername: userWithTopics.username,
      topicId: topic.id,
      type: "all",
    });
  });
});
