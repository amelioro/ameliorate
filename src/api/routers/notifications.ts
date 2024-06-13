import { TRPCError } from "@trpc/server";

import { isLoggedIn } from "@/api/auth";
import { procedure, router } from "@/api/trpc";
import { inAppNotificationSchema } from "@/common/inAppNotification";
import { topicSchema } from "@/common/topic";
import { xprisma } from "@/db/extendedPrisma";

export const notificationRouter = router({
  findAll: procedure.use(isLoggedIn).query(async (opts) => {
    const notifications = await xprisma.inAppNotification.findMany({
      where: { notifiedUsername: opts.ctx.user.username },
      include: { topic: true },
      orderBy: { createdAt: "desc" },
    });

    // we already know most of the types, but we're parsing so that the `notification.data` is typed
    return inAppNotificationSchema.extend({ topic: topicSchema }).array().parse(notifications);
  }),

  delete: procedure
    .use(isLoggedIn)
    .input(inAppNotificationSchema.pick({ id: true }))
    .mutation(async (opts) => {
      const notificationToDelete = await xprisma.inAppNotification.findUnique({
        where: { id: opts.input.id },
      });

      if (!notificationToDelete || notificationToDelete.notifiedUsername !== opts.ctx.user.username)
        throw new TRPCError({ code: "FORBIDDEN" });

      await xprisma.inAppNotification.delete({
        where: { id: opts.input.id },
      });
    }),
});
