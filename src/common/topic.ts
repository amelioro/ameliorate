import { z } from "zod";

import { reservedSecondLevelEndpointNames } from "@/common/reservedEndpointNames";
import { userSchema } from "@/common/user";
import { getBaseUrl } from "@/common/utils";

// not sure how to guarantee that this matches the schema enum
export const visibilityTypes = ["private", "unlisted", "public"] as const;

const zVisibilityTypes = z.enum(visibilityTypes);

export type VisibilityType = z.infer<typeof zVisibilityTypes>;

export const topicSchema = z.object({
  id: z.number(),
  title: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,99}$/i, // match github username rules but with repo name length, thanks https://github.com/shinnn/github-username-regex/blob/master/index.js
      "Title may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.",
    )
    .refine(
      (topic) => !reservedSecondLevelEndpointNames.includes(topic.toLocaleLowerCase()),
      (topic) => ({ message: `${topic} is a reserved title.` }),
    ),
  creatorName: userSchema.shape.username,
  description: z.string().max(10000),
  visibility: zVisibilityTypes,
  allowAnyoneToEdit: z.boolean(),
});

export type Topic = z.infer<typeof topicSchema>;

export const getLinkToTopic = (topic: Topic) => {
  const sourceUrl = new URL(`/${topic.creatorName}/${topic.title}`, getBaseUrl());

  return sourceUrl.href;
};
