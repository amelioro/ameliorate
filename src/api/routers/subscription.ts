import { isLoggedIn } from "@/api/auth";
import { procedure, router } from "@/api/trpc";
import { subscriptionSchema } from "@/common/subscription";
import { xprisma } from "@/db/extendedPrisma";

export const subscriptionRouter = router({
  find: procedure
    .use(isLoggedIn)
    .input(subscriptionSchema.pick({ sourceId: true }))
    .query(async (opts) => {
      return await xprisma.subscription.findUnique({
        where: {
          subscriberUsername_sourceId: {
            subscriberUsername: opts.ctx.user.username,
            sourceId: opts.input.sourceId,
          },
        },
      });
    }),

  create: procedure
    .use(isLoggedIn)
    .input(subscriptionSchema.pick({ sourceId: true }))
    .mutation(async (opts) => {
      await xprisma.subscription.create({
        data: {
          subscriberUsername: opts.ctx.user.username,
          sourceId: opts.input.sourceId,
          sourceType: "threadStarterComment",
        },
      });
    }),

  delete: procedure
    .use(isLoggedIn)
    .input(subscriptionSchema.pick({ sourceId: true }))
    .mutation(async (opts) => {
      await xprisma.subscription.delete({
        where: {
          subscriberUsername_sourceId: {
            subscriberUsername: opts.ctx.user.username,
            sourceId: opts.input.sourceId,
          },
        },
      });
    }),
});
