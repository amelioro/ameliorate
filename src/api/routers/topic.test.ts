/* eslint-disable functional/no-let -- let is needed to reuse `before`-initialized variables across tests */
import { Topic, User } from "@prisma/client";
import { beforeEach, describe, expect, test } from "vitest";

import { xprisma } from "../../db/extendedPrisma";
import { appRouter } from "./_app";

let userWithTopics: User;
let publicTopic: Topic;
let unlistedTopic: Topic;
let privateTopic: Topic;

beforeEach(async () => {
  userWithTopics = await xprisma.user.create({
    data: { username: "hasTopicsName", authId: "hasTopicsAuth" },
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
});

describe("findByUsernameAndTitle", () => {
  describe("when viewing your own topic", () => {
    test("can view private topic", async () => {
      const trpc = appRouter.createCaller({
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
      const trpc = appRouter.createCaller({});

      const topic = await trpc.topic.findByUsernameAndTitle({
        username: userWithTopics.username,
        title: publicTopic.title,
      });

      expect(topic).toStrictEqual(publicTopic);
    });

    test("can view unlisted topic", async () => {
      const trpc = appRouter.createCaller({});

      const topic = await trpc.topic.findByUsernameAndTitle({
        username: userWithTopics.username,
        title: unlistedTopic.title,
      });

      expect(topic).toStrictEqual(unlistedTopic);
    });

    test("cannot view private topic", async () => {
      const trpc = appRouter.createCaller({});

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
      const trpc = appRouter.createCaller({
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
      const trpc = appRouter.createCaller({});

      const topic = await trpc.topic.getData({
        username: userWithTopics.username,
        title: publicTopic.title,
      });

      expect(topic?.id).toBe(publicTopic.id);
    });

    test("can view unlisted topic", async () => {
      const trpc = appRouter.createCaller({});

      const topic = await trpc.topic.getData({
        username: userWithTopics.username,
        title: unlistedTopic.title,
      });

      expect(topic?.id).toBe(unlistedTopic.id);
    });

    test("cannot view private topic", async () => {
      const trpc = appRouter.createCaller({});

      const topic = await trpc.topic.getData({
        username: userWithTopics.username,
        title: privateTopic.title,
      });

      expect(topic).toBeNull();
    });
  });
});
