/* eslint-disable functional/no-let -- let is needed to reuse `before`-initialized variables across tests */
import { beforeEach, describe, expect, test } from "vitest";

import { createCaller } from "@/api/routers/_app";
import { xprisma } from "@/db/extendedPrisma";
import { Topic, User } from "@/db/generated/prisma/client";

import { testEmail } from "../../../scripts/setupTests";

let userWithTopics: User;
let publicTopic: Topic;
let unlistedTopic: Topic;
let privateTopic: Topic;

let otherUser: User;

beforeEach(async () => {
  userWithTopics = await xprisma.user.create({
    data: { username: "hasTopicsName", authId: "hasTopicsAuth", email: testEmail },
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

  otherUser = await xprisma.user.create({
    data: { username: "otherName", authId: "otherAuth", email: testEmail },
  });
});

describe("findByUsername", () => {
  describe("when viewing your own topics", () => {
    test("returns all topics", async () => {
      const trpc = createCaller({
        userAuthId: userWithTopics.authId,
        userEmailVerified: true,
        user: userWithTopics,
      });

      const user = await trpc.user.findByUsername({ username: userWithTopics.username });

      expect(user?.topics).toStrictEqual([publicTopic, unlistedTopic, privateTopic]);
    });
  });

  describe("when logged in and viewing someone else's topics", () => {
    test("returns only public topics", async () => {
      const trpc = createCaller({
        userAuthId: otherUser.authId,
        userEmailVerified: true,
        user: otherUser,
      });

      const user = await trpc.user.findByUsername({ username: userWithTopics.username });

      expect(user?.topics).toStrictEqual([publicTopic]);
    });
  });

  describe("when logged out and viewing someone else's topics", () => {
    test("returns only public topics", async () => {
      const trpc = createCaller({});

      const user = await trpc.user.findByUsername({ username: userWithTopics.username });

      expect(user?.topics).toStrictEqual([publicTopic]);
    });
  });
});
