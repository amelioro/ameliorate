import { z } from "zod";

import { zSourceTypes } from "@/common/subscription";
import { userSchema } from "@/common/user";

export const unsubscribeCodeSchema = z.object({
  code: z.string(),
  subscriberUsername: userSchema.shape.username,
  subscriptionSourceId: z.string(),
  subscriptionSourceType: zSourceTypes,
});
