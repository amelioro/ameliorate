import { z } from "zod";

import { userSchema } from "@/common/user";

export const userScoreSchema = z.object({
  username: userSchema.shape.username,
  graphPartId: z.string().uuid(),
  topicId: z.number(),
  // would be nice to keep this in sync with front-end's string equivalent that includes '-',
  // but it doesn't seem worth to save '-' scores in the db
  value: z.number().min(1).max(9),
});

export type UserScore = z.infer<typeof userScoreSchema>;

export const topicAIScoreSchema = z.object({
  tempGraphPartId: z.number().describe("tempId of the node or edge being scored."),
  value: userScoreSchema.shape.value,
});

/**
 * Looser schema to make hitting the API easier for consumers. Mainly different from `userScoreSchema` in that many fields are optional and can use `tempGraphPartId`.
 */
export const createScoreSchema = userScoreSchema
  .extend(topicAIScoreSchema.shape)
  .partial({ graphPartId: true, tempGraphPartId: true, username: true, topicId: true })
  .refine((data) => {
    return data.graphPartId !== undefined || data.tempGraphPartId !== undefined;
  }, "Must provide either graphPartId or tempGraphPartId.")
  .describe(
    "Can use `tempGraphPartId` to reference a node/edge that hasn't been persisted yet, via its `tempId`. `username` defaults to the authenticated user, and `topicId` defaults to the request's `topicId`.",
  );

export type CreateScore = z.infer<typeof createScoreSchema>;

export const possibleDisplayScores = ["-", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export const diagramStoreUserScoresSchema = z.record(z.record(z.enum(possibleDisplayScores)));
