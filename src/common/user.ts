import { z } from "zod";

export const userSchema = z.object({
  id: z.number(),
  username: z
    .string()
    .min(1)
    .max(39)
    .regex(
      /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, // match github rules, thanks https://github.com/shinnn/github-username-regex/blob/master/index.js
      "Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen."
    ),
  authId: z.string(),
});
