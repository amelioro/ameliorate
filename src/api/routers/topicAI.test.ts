import { describe, expect, test } from "vitest";

import { appRouter } from "@/api/routers/_app";

describe("getPromptData", () => {
  test("returns expected schemas and examples", async () => {
    const trpc = appRouter.createCaller({});

    const promptData = await trpc.topicAI.getPromptData();

    await expect(JSON.stringify(promptData, undefined, 2)).toMatchFileSnapshot(
      "./__snapshots__/topicAI.getPromptData.json",
    );
  });
});
