import { z } from "zod";

export const userScoreSchema = z.object({
  userId: z.number(),
  graphPartId: z.string().uuid(),
  topicId: z.number(),
  // would be nice to keep this in sync with front-end's string equivalent that includes '-',
  // but it doesn't seem worth to save '-' scores in the db
  value: z.number().min(0).max(9),
});
