import { z } from "zod";

import { userSchema } from "@/common/user";

export const userScoreSchema = z.object({
  username: userSchema.shape.username,
  graphPartId: z.string().uuid(),
  topicId: z.number(),
  // would be nice to keep this in sync with front-end's string equivalent that includes '-',
  // but it doesn't seem worth to save '-' scores in the db
  value: z.number().min(0).max(9),
});

export type UserScore = z.infer<typeof userScoreSchema>;
