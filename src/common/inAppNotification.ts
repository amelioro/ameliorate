import { z } from "zod";

import { baseCommentSchema } from "@/common/comment";
import { topicSchema } from "@/common/topic";
import { userSchema } from "@/common/user";

export const notificationTypes = ["commentCreated"] as const;
export const zNotificationTypes = z.enum(notificationTypes);
export type NotificationType = z.infer<typeof zNotificationTypes>;

// future: make this based on the notification type
export const notificationDataSchema = z.object({
  commentId: baseCommentSchema.shape.id,
});

export const maxMessageLength = 500;

export const inAppNotificationSchema = z.object({
  id: z.number(),
  notifiedUsername: userSchema.shape.username,
  topicId: topicSchema.shape.id.nullable(),
  type: zNotificationTypes,
  data: notificationDataSchema,
  message: z.string().max(maxMessageLength),
  sourceUrl: z.string().max(1000),
  createdAt: z.date(),
});

export type InAppNotification = z.infer<typeof inAppNotificationSchema>;
