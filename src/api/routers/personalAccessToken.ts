import { TRPCError } from "@trpc/server";

import { isLoggedInViaSession } from "@/api/auth";
import { generateToken } from "@/api/personalAccessTokenAuth";
import { procedure, router } from "@/api/trpc";
import {
  createPersonalAccessTokenInput,
  personalAccessTokenSchema,
} from "@/common/personalAccessToken";
import { xprisma } from "@/db/extendedPrisma";

export const personalAccessTokenRouter = router({
  list: procedure.use(isLoggedInViaSession).query(async (opts) => {
    return await xprisma.personalAccessToken.findMany({
      where: { ownerUsername: opts.ctx.user.username },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: procedure
    .use(isLoggedInViaSession)
    .input(createPersonalAccessTokenInput)
    .mutation(async (opts) => {
      const { plaintext, hash } = generateToken();

      const pat = await xprisma.personalAccessToken.create({
        data: {
          ownerUsername: opts.ctx.user.username,
          name: opts.input.name,
          tokenHash: hash,
          expiresAt: opts.input.expiresAt ?? null,
        },
      });

      return { ...pat, plaintext };
    }),

  revoke: procedure
    .use(isLoggedInViaSession)
    .input(personalAccessTokenSchema.pick({ id: true }))
    .mutation(async (opts) => {
      const pat = await xprisma.personalAccessToken.findUnique({
        where: { id: opts.input.id },
      });

      if (!pat || pat.ownerUsername !== opts.ctx.user.username) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Token not found" });
      }

      // seems fine for revocation to be idempotent i.e. no-op if already revoked
      if (pat.revokedAt !== null) return pat;

      return await xprisma.personalAccessToken.update({
        where: { id: opts.input.id },
        data: { revokedAt: new Date() },
      });
    }),
});
