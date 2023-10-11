import { TRPCError } from "@trpc/server";
import _ from "lodash";
import { z } from "zod";

import { edgeSchema } from "../../common/edge";
import { getNewTopicProblemNode, nodeSchema } from "../../common/node";
import { topicSchema } from "../../common/topic";
import { userSchema } from "../../common/user";
import { userScoreSchema } from "../../common/userScore";
import { xprisma } from "../../db/extendedPrisma";
import { isLoggedIn } from "../auth";
import { procedure, router } from "../trpc";

export const topicRouter = router({
  findByUsernameAndTitle: procedure
    .input(
      z.object({
        username: userSchema.shape.username,
        title: topicSchema.shape.title,
      })
    )
    .query(async (opts) => {
      const isCreator = opts.input.username === opts.ctx.user?.username;

      return await xprisma.topic.findFirst({
        where: {
          title: opts.input.title,
          creatorName: opts.input.username,
          visibility: isCreator ? undefined : { not: "private" },
        },
      });
    }),

  /**
   * Return a topic with all its nodes and edges, and each user's scores.
   *
   * When we want to expose different amounts of topic data, we can rename this to be distinctive.
   */
  getData: procedure
    .input(
      z.object({
        username: userSchema.shape.username,
        title: topicSchema.shape.title,
      })
    )
    .query(async (opts) => {
      const isCreator = opts.input.username === opts.ctx.user?.username;

      return await xprisma.topic.findFirst({
        where: {
          title: opts.input.title,
          creatorName: opts.input.username,
          visibility: isCreator ? undefined : { not: "private" },
        },
        include: {
          nodes: true,
          edges: true,
          userScores: true,
        },
      });
    }),

  /**
   * Set topic data.
   *
   * The intent is to generically mass-create, -update, -delete, based on diffs to state changed in the UI.
   *
   * Unfortunately, there's a lot of logic and complexity here because we're making changes generically
   * and are handling many different situations and many different inputs.
   *
   * The main reasons for making this generic are:
   * - allow zustand to continue enabling undo/redo functionality, rather than creating a custom undo/redo
   *   pattern to handle api calls in addition to store state changes
   * - allow front changes to be less coupled to api changes, so that performance is better, the playground
   *   can operate without saving to the db, and offline functionality is easier/possible
   *
   * Things to watch out for that may make it worth handling changes with separate routes, rather than
   * one generic route:
   * - needing logic that's very specific to one action (e.g. allow deleting other users' scores if deleting a graph part)
   * - refactoring the topic store into multiple stores, to separate undo/redo from view back/forward
   */
  setData: procedure
    .use(isLoggedIn)
    .input(
      z.object({
        topicId: topicSchema.shape.id,
        nodesToCreate: z.array(nodeSchema),
        nodesToUpdate: z.array(nodeSchema.partial().required({ id: true, topicId: true })),
        nodesToDelete: z.array(nodeSchema.pick({ id: true, topicId: true })),
        edgesToCreate: z.array(edgeSchema),
        edgesToUpdate: z.array(edgeSchema.partial().required({ id: true, topicId: true })),
        edgesToDelete: z.array(edgeSchema.pick({ id: true, topicId: true })),
        scoresToCreate: z.array(userScoreSchema),
        scoresToUpdate: z.array(userScoreSchema),
        scoresToDelete: z.array(
          userScoreSchema.pick({ username: true, graphPartId: true, topicId: true })
        ),
      })
    )
    .mutation(async (opts) => {
      // authorize
      const topic = await xprisma.topic.findUnique({ where: { id: opts.input.topicId } });
      const isCreator = opts.ctx.user.username === topic?.creatorName;

      if (!topic || (!isCreator && topic.visibility === "private"))
        throw new TRPCError({ code: "FORBIDDEN" });

      const graphPartLists = [
        opts.input.nodesToCreate,
        opts.input.nodesToUpdate,
        opts.input.nodesToDelete,
        opts.input.edgesToCreate,
        opts.input.edgesToUpdate,
        opts.input.edgesToDelete,
      ];
      const topicObjectLists: { topicId: number }[][] = [
        ...graphPartLists,
        opts.input.scoresToCreate,
        opts.input.scoresToUpdate,
        opts.input.scoresToDelete,
      ];

      const graphPartsChangedByNotCreator =
        !isCreator && graphPartLists.some((graphParts) => graphParts.length > 0);

      // ensure requests don't try changing nodes/edges/scores from other topics
      const onlyChangingObjectsFromThisTopic = topicObjectLists.every((topicObjects) =>
        topicObjects.every((topicObject) => topicObject.topicId === topic.id)
      );

      if (graphPartsChangedByNotCreator || !onlyChangingObjectsFromThisTopic) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const authorizedToDeleteScore =
        opts.input.scoresToDelete.every((score) => score.username === opts.ctx.user.username) ||
        // creator can delete another user's score indirectly, by deleting the score's graphPart
        opts.input.scoresToDelete.every((score) => {
          const scoreIsForGraphPartBeingDeleted = [
            ...opts.input.nodesToDelete,
            ...opts.input.edgesToDelete,
          ].some((graphPart) => graphPart.id === score.graphPartId);

          return isCreator && scoreIsForGraphPartBeingDeleted;
        });
      const authorizedToUpsertScore = [
        ...opts.input.scoresToCreate,
        ...opts.input.scoresToUpdate,
      ].every((score) => score.username === opts.ctx.user.username);

      if (!authorizedToDeleteScore || !authorizedToUpsertScore)
        throw new TRPCError({ code: "FORBIDDEN" });

      // make changes
      await xprisma.$transaction(async (tx) => {
        // scores points to edges/nodes, and edges point to nodes, so create nodes -> edges -> scores, and delete in reverse
        if (opts.input.nodesToCreate.length > 0)
          await tx.node.createMany({ data: opts.input.nodesToCreate });
        if (opts.input.edgesToCreate.length > 0)
          await tx.edge.createMany({ data: opts.input.edgesToCreate });
        if (opts.input.scoresToCreate.length > 0)
          await tx.userScore.createMany({ data: opts.input.scoresToCreate });

        /* eslint-disable functional/no-loop-statement -- seems like functional methods don't work with promises nicely https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop#comment65277758_37576787 */
        for (const node of opts.input.nodesToUpdate)
          await tx.node.update({ where: { id: node.id }, data: node });
        for (const edge of opts.input.edgesToUpdate)
          await tx.edge.update({ where: { id: edge.id }, data: edge });
        for (const score of opts.input.scoresToUpdate) {
          await tx.userScore.update({
            where: {
              username_graphPartId: { username: score.username, graphPartId: score.graphPartId },
            },
            data: score,
          });
        }
        /* eslint-enable functional/no-loop-statement */

        // deleting a graph part in the UI will send over deletions for other user's scores
        // this should be allowed, and that is why we loop over scores here - deleteMany wouldn't
        // be able to `where` for multiple user x graph part combinations
        // eslint-disable-next-line functional/no-loop-statement
        for (const score of opts.input.scoresToDelete) {
          await tx.userScore.delete({
            where: {
              username_graphPartId: {
                username: score.username,
                graphPartId: score.graphPartId,
              },
            },
          });
        }
        if (opts.input.edgesToDelete.length > 0) {
          await tx.edge.deleteMany({
            where: { id: { in: opts.input.edgesToDelete.map((edge) => edge.id) } },
          });
        }
        if (opts.input.nodesToDelete.length > 0) {
          await tx.node.deleteMany({
            where: { id: { in: opts.input.nodesToDelete.map((node) => node.id) } },
          });
        }
      });
    }),

  create: procedure
    .use(isLoggedIn)
    .input(topicSchema.pick({ title: true, visibility: true }))
    .mutation(async (opts) => {
      const newTopic = await xprisma.topic.create({
        data: {
          title: opts.input.title,
          creatorName: opts.ctx.user.username,
          visibility: opts.input.visibility,
        },
      });

      const _baseTopicProblemNode = await xprisma.node.create({
        data: getNewTopicProblemNode(newTopic.id, newTopic.title),
      });

      return newTopic;
    }),

  update: procedure
    .use(isLoggedIn)
    .input(topicSchema.pick({ id: true, title: true, visibility: true }))
    .mutation(async (opts) => {
      const topic = await xprisma.topic.findUniqueOrThrow({ where: { id: opts.input.id } });
      if (opts.ctx.user.username !== topic.creatorName) throw new TRPCError({ code: "FORBIDDEN" });

      return await xprisma.topic.update({
        where: { id: opts.input.id },
        data: {
          title: opts.input.title,
          visibility: opts.input.visibility,
        },
      });
    }),

  delete: procedure
    .use(isLoggedIn)
    .input(topicSchema.pick({ id: true }))
    .mutation(async (opts) => {
      const topic = await xprisma.topic.findUniqueOrThrow({ where: { id: opts.input.id } });
      if (opts.ctx.user.username !== topic.creatorName) throw new TRPCError({ code: "FORBIDDEN" });

      await xprisma.topic.delete({ where: { id: opts.input.id } });

      return null;
    }),
});
