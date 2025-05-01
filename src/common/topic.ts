import { z } from "zod";

import { reservedSecondLevelEndpointNames } from "@/common/reservedEndpointNames";
import { userSchema } from "@/common/user";
import { getBaseUrl } from "@/common/utils";

// not sure how to guarantee that this matches the schema enum
export const visibilityTypes = ["private", "unlisted", "public"] as const;

const zVisibilityTypes = z.enum(visibilityTypes);

export type VisibilityType = z.infer<typeof zVisibilityTypes>;

export const normalizeTitle = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace all spaces with single hyphen
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Trim leading/trailing hyphens
};

export const topicSchema = z.object({
  id: z.number(),
  title: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^(?![ -])(?!.*[ -]$)[a-zA-Z0-9 -]+$/,
      "Title may only contain alphanumeric characters,spaces or single hyphens, and cannot begin or end with a hyphen.",
    )
    .refine(
      (title) => !reservedSecondLevelEndpointNames.includes(title.toLocaleLowerCase()),
      (title) => ({ message: `${title} is a reserved title.` }),
    ),

  creatorName: userSchema.shape.username,
  description: z.string().max(10000),
  visibility: zVisibilityTypes,
  allowAnyoneToEdit: z.boolean(),
});

export type Topic = z.infer<typeof topicSchema>;

export const getLinkToTopic = (topic: Topic) => {
  const sourceUrl = new URL(`/${topic.creatorName}/${normalizeTitle(topic.title)}`, getBaseUrl());

  return sourceUrl.href;
};
