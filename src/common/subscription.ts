import { z } from "zod";

import { userSchema } from "@/common/user";

const sourceTypes = ["threadStarterComment"] as const;
export const zSourceTypes = z.enum(sourceTypes);

export const subscriptionSchema = z.object({
  id: z.number(),
  subscriberUsername: userSchema.shape.username,
  sourceId: z.string(),
  sourceType: zSourceTypes,
});
