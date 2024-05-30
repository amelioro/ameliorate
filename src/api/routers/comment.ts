import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { isLoggedIn } from "@/api/auth";
import { procedure, router } from "@/api/trpc";
import { Comment, commentSchema, userCanDeleteComment } from "@/common/comment";
import { topicSchema } from "@/common/topic";
import { deepIsEqual } from "@/common/utils";
import { xprisma } from "@/db/extendedPrisma";

const isOnlyModifyingResolved = (commentToUpdate: Comment, foundComment: Comment) => {
  return (
    foundComment.resolved !== commentToUpdate.resolved &&
    deepIsEqual(foundComment, { ...commentToUpdate, resolved: foundComment.resolved })
  );
};

export const commentRouter = router({
  handleChangesets: procedure
    .use(isLoggedIn)
    .input(
      z.object({
        topicId: topicSchema.shape.id,
        commentsToCreate: commentSchema.array(),
        commentsToUpdate: commentSchema.array(),
        commentsToDelete: commentSchema.array(),
      })
    )
    .mutation(async (opts) => {
      const { commentsToCreate, commentsToUpdate, commentsToDelete } = opts.input;
      const topic = await xprisma.topic.findUniqueOrThrow({ where: { id: opts.input.topicId } });

      // annoying extra complexity to distinguish resolving from editing, wouldn't need this if we only sent the fields that are actually changing over the API
      // but if we did that, we wouldn't be able to properly validate "resolved" using zod schema (because it depends on other fields i.e. parent type)
      const foundCommentsToUpdate = await xprisma.comment.findMany({
        where: { id: { in: commentsToUpdate.map((comment) => comment.id) } },
      });
      const commentsToOnlyModifyResolved = commentsToUpdate.filter((comment) => {
        const foundComment = foundCommentsToUpdate.find((c) => c.id === comment.id);
        if (!foundComment) throw new Error("trying to update comment that wasn't found");
        return isOnlyModifyingResolved(comment, foundComment);
      });
      const commentsToModifyOtherThanResolved = commentsToUpdate.filter(
        (comment) => !commentsToOnlyModifyResolved.some((c) => c.id === comment.id)
      );

      // ensure has permissions
      const commentsAllForSameTopic = [
        ...commentsToCreate,
        ...commentsToUpdate,
        ...commentsToDelete,
      ].every((comment) => comment.topicId === opts.input.topicId);

      const userIsCreator = opts.ctx.user.username === topic.creatorName;
      const userCanEditTopic = userIsCreator || topic.allowAnyoneToEdit;

      const userCanUpsertTheComments = [
        ...commentsToCreate,
        ...commentsToModifyOtherThanResolved,
      ].every((comment) => comment.authorName === opts.ctx.user.username);

      const userCanResolveTheComments = commentsToOnlyModifyResolved.every(
        (comment) => userCanEditTopic || comment.authorName === opts.ctx.user.username
      );
      const userCanDeleteTheComments = commentsToDelete.every((comment) =>
        userCanDeleteComment(opts.ctx.user.username, userCanEditTopic, comment, commentsToDelete)
      );

      if (
        !commentsAllForSameTopic ||
        !userCanUpsertTheComments ||
        !userCanResolveTheComments ||
        !userCanDeleteTheComments
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // handle changes
      await xprisma.$transaction(async (tx) => {
        if (opts.input.commentsToCreate.length > 0) {
          await tx.comment.createMany({ data: opts.input.commentsToCreate });
        }

        if (opts.input.commentsToUpdate.length > 0) {
          /* eslint-disable functional/no-loop-statements -- seems like functional methods don't work with promises nicely https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop#comment65277758_37576787 */
          for (const comment of opts.input.commentsToUpdate)
            await tx.comment.update({ where: { id: comment.id }, data: comment });
        }

        if (opts.input.commentsToDelete.length > 0) {
          await tx.comment.deleteMany({
            where: { id: { in: opts.input.commentsToDelete.map((comment) => comment.id) } },
          });
        }
      });
    }),
});
