import { TRPCError } from "@trpc/server";
import shortUUID from "short-uuid";
import { z } from "zod";

import { isLoggedIn } from "@/api/auth";
import { procedure, router } from "@/api/trpc";
import { topicSchema } from "@/common/topic";
import { quickViewSchema } from "@/common/view";
import { xprisma } from "@/db/extendedPrisma";

export const viewRouter = router({
  handleChangesets: procedure
    .use(isLoggedIn)
    .input(
      z.object({
        topicId: topicSchema.shape.id,
        // allow id to be optional for ease of API use, in which case we'll generate one
        viewsToCreate: quickViewSchema.partial({ id: true }).array().default([]),
        viewsToUpdate: quickViewSchema.array().default([]),
        viewsToDelete: quickViewSchema.array().default([]),
      }),
    )
    .mutation(async (opts) => {
      const { viewsToCreate, viewsToUpdate, viewsToDelete } = opts.input;

      const topic = await xprisma.topic.findUniqueOrThrow({ where: { id: opts.input.topicId } });
      const userIsCreator = opts.ctx.user.username === topic.creatorName;
      const userCanEditTopic = userIsCreator || topic.allowAnyoneToEdit;
      const viewsAllForSameTopic = [...viewsToCreate, ...viewsToUpdate, ...viewsToDelete].every(
        (view) => view.topicId === opts.input.topicId,
      );

      if (!userCanEditTopic || !viewsAllForSameTopic) throw new TRPCError({ code: "FORBIDDEN" });

      const solidifiedViewsToCreate = viewsToCreate.map((view) => ({
        ...view,
        id: view.id ?? shortUUID.generate(),
      }));

      await xprisma.$transaction(async (tx) => {
        // if uploading a set of views that share titles with the current set of views, current set needs to be deleted before new set is created
        if (opts.input.viewsToDelete.length > 0) {
          await tx.view.deleteMany({
            where: { id: { in: opts.input.viewsToDelete.map((view) => view.id) } },
          });
        }

        if (solidifiedViewsToCreate.length > 0) {
          await tx.view.createMany({ data: solidifiedViewsToCreate });
        }

        if (opts.input.viewsToUpdate.length > 0) {
          /* eslint-disable functional/no-loop-statements -- seems like functional methods don't work with promises nicely https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop#comment65277758_37576787 */
          for (const view of opts.input.viewsToUpdate)
            await tx.view.update({ where: { id: view.id }, data: view });
        }
      });
    }),
});
