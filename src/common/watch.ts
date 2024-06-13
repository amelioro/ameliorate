import { z } from "zod";

import { topicSchema } from "@/common/topic";
import { userSchema } from "@/common/user";

export const watchTypes = ["participatingOrMentions", "all", "ignore"] as const;
export const zWatchTypes = z.enum(watchTypes);
export type WatchType = z.infer<typeof zWatchTypes>;

export const watchSchema = z.object({
  id: z.number(),
  watcherUsername: userSchema.shape.username,
  topicId: topicSchema.shape.id,
  type: zWatchTypes,
});
