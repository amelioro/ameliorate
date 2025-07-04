import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { isLoggedIn } from "@/api/auth";
import { procedure, router } from "@/api/trpc";
import { edgeSchema } from "@/common/edge";
import { getNewTopicProblemNode, nodeSchema } from "@/common/node";
import { topicSchema } from "@/common/topic";
import { userSchema } from "@/common/user";
import { userScoreSchema } from "@/common/userScore";
import { quickViewSchema } from "@/common/view";
import { xprisma } from "@/db/extendedPrisma";

export const topicRouter = router({
  findByUsernameAndTitle: procedure
    .input(
      z.object({
        username: userSchema.shape.username,
        title: topicSchema.shape.title,
      }),
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
   * Return a topic with all its nodes, edges, each user's scores and comments, and the topic's views.
   *
   * When we want to expose different amounts of topic data, we can rename this to be distinctive.
   */
  getData: procedure
    .input(
      z.object({
        username: userSchema.shape.username,
        title: topicSchema.shape.title,
      }),
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
          views: true,
          comments: true,
        },
      });
    }),

  /**
   * Set topic diagram data.
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
  updateDiagram: procedure
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
          userScoreSchema.pick({ username: true, graphPartId: true, topicId: true }),
        ),
      }),
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

      const graphPartsChanged = graphPartLists.some((graphParts) => graphParts.length > 0);
      const isEditor = topic.allowAnyoneToEdit || isCreator;
      const nonCreatorMadeRestrictedChanges = !isEditor && graphPartsChanged;

      // ensure requests don't try changing nodes/edges/scores from other topics
      const onlyChangingObjectsFromThisTopic = topicObjectLists.every((topicObjects) =>
        topicObjects.every((topicObject) => topicObject.topicId === topic.id),
      );

      if (nonCreatorMadeRestrictedChanges || !onlyChangingObjectsFromThisTopic) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const authorizedToDeleteScore = opts.input.scoresToDelete.every(
        (score) => score.username === opts.ctx.user.username,
      );
      const authorizedToUpsertScore = [
        ...opts.input.scoresToCreate,
        ...opts.input.scoresToUpdate,
      ].every((score) => score.username === opts.ctx.user.username);

      if (!authorizedToDeleteScore || !authorizedToUpsertScore)
        throw new TRPCError({ code: "FORBIDDEN" });

      // make changes
      await xprisma.$transaction(async (tx) => {
        // count any not-user-specific changes as a change to the topic (i.e. node/edge changes, not scores)
        if (graphPartsChanged) {
          await tx.topic.update({
            where: { id: opts.input.topicId },
            data: { updatedAt: new Date() },
          });
        }

        // scores points to edges/nodes, and edges point to nodes, so create nodes -> edges -> scores, and delete in reverse
        if (opts.input.nodesToCreate.length > 0)
          await tx.node.createMany({ data: opts.input.nodesToCreate });
        if (opts.input.edgesToCreate.length > 0)
          await tx.edge.createMany({ data: opts.input.edgesToCreate });
        if (opts.input.scoresToCreate.length > 0)
          await tx.userScore.createMany({ data: opts.input.scoresToCreate });

        /* eslint-disable functional/no-loop-statements -- seems like functional methods don't work with promises nicely https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop#comment65277758_37576787 */
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
        /* eslint-enable functional/no-loop-statements */

        const scoresToDeletePartIds = opts.input.scoresToDelete.map((score) => score.graphPartId);
        await tx.userScore.deleteMany({
          where: {
            username: opts.ctx.user.username, // authorized earlier that all scores to delete are for this user
            graphPartId: { in: scoresToDeletePartIds },
          },
        });
        const edgeIdsToDelete = opts.input.edgesToDelete.map((edge) => edge.id);
        if (edgeIdsToDelete.length > 0) {
          await tx.edge.deleteMany({
            where: { id: { in: edgeIdsToDelete } },
          });
        }
        const nodeIdsToDelete = opts.input.nodesToDelete.map((node) => node.id);
        if (nodeIdsToDelete.length > 0) {
          await tx.node.deleteMany({
            where: { id: { in: nodeIdsToDelete } },
          });
        }
      });
    }),

  create: procedure
    .use(isLoggedIn)
    .input(
      z.object({
        topic: topicSchema.pick({
          title: true,
          description: true,
          visibility: true,
          allowAnyoneToEdit: true,
        }),
        // TODO: create basic views without passing over API when default view state is decoupled from web types
        quickViews: quickViewSchema.omit({ topicId: true }).array(), // omit topic because we'll set it on creation here
      }),
    )
    .mutation(async (opts) => {
      const newTopic = await xprisma.topic.create({
        data: {
          title: opts.input.topic.title,
          creatorName: opts.ctx.user.username,
          description: opts.input.topic.description,
          visibility: opts.input.topic.visibility,
          allowAnyoneToEdit: opts.input.topic.allowAnyoneToEdit,
        },
      });

      const _baseTopicProblemNode = await xprisma.node.create({
        data: getNewTopicProblemNode(newTopic.id, newTopic.title),
      });

      // create basic views for topic
      await xprisma.view.createMany({
        data: opts.input.quickViews.map((view) => ({
          ...view,
          topicId: newTopic.id,
        })),
      });

      // default creator as a watcher of the topic; no need to check if a watch exists because topic is new
      await xprisma.watch.create({
        data: {
          watcherUsername: opts.ctx.user.username,
          topicId: newTopic.id,
          type: "all",
        },
      });

      return newTopic;
    }),

  update: procedure
    .use(isLoggedIn)
    .input(
      topicSchema
        .pick({
          id: true,
          title: true,
          description: true,
          visibility: true,
          allowAnyoneToEdit: true,
        })
        // allow updating only some fields, e.g. description from the topic workspace
        .partial({ title: true, description: true, visibility: true, allowAnyoneToEdit: true }),
    )
    .mutation(async (opts) => {
      const topic = await xprisma.topic.findUniqueOrThrow({ where: { id: opts.input.id } });
      if (opts.ctx.user.username !== topic.creatorName) throw new TRPCError({ code: "FORBIDDEN" });

      return await xprisma.topic.update({
        where: { id: opts.input.id },
        data: {
          title: opts.input.title,
          description: opts.input.description,
          visibility: opts.input.visibility,
          allowAnyoneToEdit: opts.input.allowAnyoneToEdit,
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
