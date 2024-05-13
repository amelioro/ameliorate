import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { topicSchema } from "../../common/topic";
import { quickViewSchema } from "../../common/view";
import { xprisma } from "../../db/extendedPrisma";
import { isLoggedIn } from "../auth";
import { procedure, router } from "../trpc";

export const viewRouter = router({
  createMany: procedure
    .use(isLoggedIn)
    .input(
      z.object({
        topicId: topicSchema.shape.id,
        views: quickViewSchema.array(),
      })
    )
    .mutation(async (opts) => {
      const someViews = opts.input.views.length > 0;
      const topic = await xprisma.topic.findUniqueOrThrow({ where: { id: opts.input.topicId } });
      const userIsCreator = opts.ctx.user.username === topic.creatorName;
      const userCanEditTopic = userIsCreator || topic.allowAnyoneToEdit;
      const viewsAllForSameTopic = opts.input.views.every(
        (view) => view.topicId === opts.input.topicId
      );

      if (!someViews || !userCanEditTopic || !viewsAllForSameTopic)
        throw new TRPCError({ code: "FORBIDDEN" });

      await xprisma.view.createMany({ data: opts.input.views });
    }),

  updateMany: procedure
    .use(isLoggedIn)
    .input(
      z.object({
        topicId: topicSchema.shape.id,
        views: quickViewSchema.array(),
      })
    )
    .mutation(async (opts) => {
      const someViews = opts.input.views.length > 0;
      const topic = await xprisma.topic.findUniqueOrThrow({ where: { id: opts.input.topicId } });
      const userIsCreator = opts.ctx.user.username === topic.creatorName;
      const userCanEditTopic = userIsCreator || topic.allowAnyoneToEdit;
      const viewsAllForSameTopic = opts.input.views.every(
        (view) => view.topicId === opts.input.topicId
      );

      if (!someViews || !userCanEditTopic || !viewsAllForSameTopic)
        throw new TRPCError({ code: "FORBIDDEN" });

      await xprisma.$transaction(async (tx) => {
        /* eslint-disable functional/no-loop-statements -- seems like functional methods don't work with promises nicely https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop#comment65277758_37576787 */
        for (const view of opts.input.views)
          await tx.view.update({ where: { id: view.id }, data: view });
      });
    }),

  deleteMany: procedure
    .use(isLoggedIn)
    .input(
      z.object({
        topicId: topicSchema.shape.id,
        views: quickViewSchema.array(),
      })
    )
    .mutation(async (opts) => {
      const someViews = opts.input.views.length > 0;
      const topic = await xprisma.topic.findUniqueOrThrow({ where: { id: opts.input.topicId } });
      const userIsCreator = opts.ctx.user.username === topic.creatorName;
      const userCanEditTopic = userIsCreator || topic.allowAnyoneToEdit;
      const viewsAllForSameTopic = opts.input.views.every(
        (view) => view.topicId === opts.input.topicId
      );

      if (!someViews || !userCanEditTopic || !viewsAllForSameTopic)
        throw new TRPCError({ code: "FORBIDDEN" });

      await xprisma.view.deleteMany({
        where: { id: { in: opts.input.views.map((view) => view.id) } },
      });
    }),
});
