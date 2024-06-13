import { isLoggedIn } from "@/api/auth";
import { procedure, router } from "@/api/trpc";
import { watchSchema } from "@/common/watch";
import { xprisma } from "@/db/extendedPrisma";

export const watchRouter = router({
  find: procedure
    .use(isLoggedIn)
    .input(watchSchema.pick({ topicId: true }))
    .query(async (opts) => {
      return await xprisma.watch.findUnique({
        where: {
          watcherUsername_topicId: {
            watcherUsername: opts.ctx.user.username,
            topicId: opts.input.topicId,
          },
        },
      });
    }),

  setWatch: procedure
    .use(isLoggedIn)
    .input(watchSchema.pick({ topicId: true, type: true }))
    .mutation(async (opts) => {
      await xprisma.watch.upsert({
        where: {
          watcherUsername_topicId: {
            watcherUsername: opts.ctx.user.username,
            topicId: opts.input.topicId,
          },
        },
        create: {
          watcherUsername: opts.ctx.user.username,
          topicId: opts.input.topicId,
          type: opts.input.type,
        },
        update: {
          type: opts.input.type,
        },
      });
    }),
});
