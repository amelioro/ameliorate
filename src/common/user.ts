import { z } from "zod";

import { reservedFirstLevelEndpointNames } from "@/common/reservedEndpointNames";

export const userSchema = z.object({
  id: z.number(),
  username: z
    .string()
    .min(1)
    .max(39)
    .regex(
      /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, // match github rules, thanks https://github.com/shinnn/github-username-regex/blob/master/index.js
      "Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.",
    )
    .refine(
      (username) => !reservedFirstLevelEndpointNames.includes(username.toLocaleLowerCase()),
      (username) => ({ message: `${username} is a reserved username.` }),
    ),
  authId: z.string(),
  email: z.string().email(),
  receiveEmailNotifications: z.boolean(),
});
