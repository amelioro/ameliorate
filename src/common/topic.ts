import { z } from "zod";

import { reservedSecondLevelEndpointNames } from "./reservedEndpointNames";

export const topicSchema = z.object({
  id: z.number(),
  title: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,99}$/i, // match github username rules but with repo name length, thanks https://github.com/shinnn/github-username-regex/blob/master/index.js
      "Title may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen."
    )
    .refine(
      (topic) => !reservedSecondLevelEndpointNames.includes(topic.toLocaleLowerCase()),
      (topic) => ({ message: `${topic} is a reserved title.` })
    ),
  userId: z.number(),
});
