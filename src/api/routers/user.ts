import { TRPCError } from "@trpc/server";

import { isAuthenticated, isEmailVerified } from "@/api/auth";
import { procedure, router } from "@/api/trpc";
import { userSchema } from "@/common/user";
import { xprisma } from "@/db/extendedPrisma";

export const userRouter = router({
  findByUsername: procedure
    .input(userSchema.pick({ username: true })) // prettier shoves this into one line if this comment isn't here, which is lame, so this comment is here.
    .query(async (opts) => {
      const isViewingSelf = opts.input.username === opts.ctx.user?.username;

      // Can consider making a separate endpoint for withRelations if the extra data becomes a problem and is unnecessary.
      return await xprisma.user.findUnique({
        // Manually selecting each column in order to exclude authId.
        // See prisma docs if we want to implement an exclude method, and to track if prisma has implemented it themselves yet https://www.prisma.io/docs/concepts/components/prisma-client/excluding-fields
        select: {
          id: true,
          username: true,
          topics: {
            where: {
              visibility: isViewingSelf ? undefined : "public",
            },
          },
        },
        where: { username: opts.input.username },
      });
    }),

  findByAuthId: procedure
    .use(isAuthenticated)
    .input(userSchema.pick({ authId: true }))
    .query(async (opts) => {
      // Security-wise, this might not be necessary, but there doesn't seem to be a use case for
      // allowing anyone to query by authId if you're not the user being queried for.
      if (opts.ctx.userAuthId !== opts.input.authId) throw new TRPCError({ code: "FORBIDDEN" });

      return await xprisma.user.findUnique({ where: { authId: opts.input.authId } });
    }),

  create: procedure
    .use(isEmailVerified)
    .input(userSchema.pick({ username: true, authId: true, email: true }))
    .mutation(async (opts) => {
      if (opts.ctx.userAuthId !== opts.input.authId) throw new TRPCError({ code: "FORBIDDEN" });

      return await xprisma.user.create({
        data: {
          username: opts.input.username,
          authId: opts.input.authId,
          email: opts.input.email,
        },
      });
    }),

  setReceiveEmails: procedure
    .use(isAuthenticated)
    .input(userSchema.pick({ receiveEmailNotifications: true }))
    .mutation(async (opts) => {
      return await xprisma.user.update({
        where: { authId: opts.ctx.userAuthId },
        data: { receiveEmailNotifications: opts.input.receiveEmailNotifications },
      });
    }),
});
