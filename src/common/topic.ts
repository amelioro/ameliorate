import { z } from "zod";

import { reactFlowEdgeSchema } from "@/common/edge";
import { reactFlowNodeSchema } from "@/common/node";
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

export type UserTopic = z.infer<typeof topicSchema>;

export interface PlaygroundTopic {
  id: undefined; // so we can check to see if the topic is a playground topic
  description: string;
}

export const topicFileSchema = z.object({
  topic: z.object({
    state: z.object({ topic: z.record(z.any()) }), // z.record() because without it will result in optional `state`, see https://github.com/colinhacks/zod/issues/1628
    version: z.number(),
  }),
  diagram: z.object({
    state: z.object({
      nodes: reactFlowNodeSchema.array(),
      edges: reactFlowEdgeSchema.array(),
      userScores: z.any(),
    }),
    version: z.number(),
  }),
  views: z.object({
    state: z.record(z.any()),
    version: z.number(),
  }),
});

/**
 * @param topic can be a playground topic so that we can get URLs on the playground if we want to... not super useful but could be convenient at times
 */
export const getLinkToTopic = (topic: PlaygroundTopic | UserTopic) => {
  const baseUrl = getBaseUrl();

  if (topic.id === undefined) {
    return new URL("/playground", baseUrl).href;
  } else {
    return new URL(`/${topic.creatorName}/${topic.title}`, baseUrl).href;
  }
};
