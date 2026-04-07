/**
 * Personal Access Tokens (PATs) exist so that machines can act on behalf of users, potentially
 * calling authenticated API endpoints, without needing a browser or routine manual setup by a user.
 *
 * For example, a `copilot-user` could be used to test out how well Copilot can create diagrams
 * and help refine the diagramming structure/process.
 *
 * Alternative (see https://github.com/amelioro/ameliorate/issues/928): potentially it could be
 * better to just allow "machine users" as opposed to "human users", so that it's clear to others
 * that a machine is being used. But the PAT approach seems easier for now - we can consider
 * changing this later.
 *
 * Note: PATs are currently placed in `/hidden-settings` because I expect the large majority of
 * users to never need it, and PATs otherwise would be the only thing in a `/settings` page so it
 * feels like they would stand out way more than they should.
 *
 * Note: plaintext tokens are shown exactly once at creation time and never stored. Only their hashes
 * are stored, so that a database leak doesn't reveal the tokens that can be used to authenticate.
 *
 * See .ai/design/machine-authentication-design-pat.md for potentially missing explanations.
 */
import { z } from "zod";

import { userSchema } from "@/common/user";

// short for "Ameliorate_PersonalAccessToken_"
export const TOKEN_PREFIX = "am_pat_";

export const personalAccessTokenSchema = z.object({
  id: z.number(),
  ownerUsername: userSchema.shape.username,
  name: z.string().min(1).max(100),
  // `tokenHash` generally should be excluded from clients as a precaution, and they should never need it
  // tokenHash: z.string(),
  lastUsedAt: z.date().nullable(),
  expiresAt: z.date().nullable(),
  revokedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PersonalAccessToken = z.infer<typeof personalAccessTokenSchema>;

export const createPersonalAccessTokenInput = personalAccessTokenSchema
  .pick({ name: true })
  .extend({
    expiresAt: z
      .date()
      .refine((date) => date > new Date(), { message: "Expiration date must be in the future" })
      .nullable()
      .optional(),
  });
