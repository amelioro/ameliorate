import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { findTopicByUsernameAndTitle } from "@/api/topic/topic";
import {
  getRefinedVisibleAct,
  getSummaryForNode,
  getTopicRefinedForAIWithSummaries,
  getTopicRefinedForAIWithoutSummaries,
  topicAICreatePartsSchema,
  visibleActSourceText,
} from "@/api/topicAI";
import { procedure, router } from "@/api/trpc";
import { nodeSchema } from "@/common/node";
import { topicSchema } from "@/common/topic";
import { xprisma } from "@/db/extendedPrisma";

export const topicAIRouter = router({
  getPromptData: procedure.query(() => {
    return {
      schemas: {
        createParts: zodToJsonSchema(topicAICreatePartsSchema),
      },
      examples: {
        visibleAct: {
          sourceText: visibleActSourceText,
          topic: getRefinedVisibleAct(),
        },
      },
    };
  }),
  getSummaryForNode: procedure
    .meta({
      description:
        "WARNING: this is not expected to be a stable API, this was quickly thrown together for testing with LLMs",
    })
    .input(
      z.object({
        topicCreatorName: topicSchema.shape.creatorName,
        topicTitle: topicSchema.shape.title,
        textOfNodeToSummarize: nodeSchema.shape.text,
        includeIncomingOutgoingSummaries: z
          .boolean()
          .optional()
          .default(true)
          .describe(
            "Incoming/outgoing summaries can show relations more precisely (e.g. specific labels like 'has' / 'addresses') and shows some extra nodes (e.g. criteria/neutral-effects for solutions/problems), but the extra nodes might not be useful, and most of these are nodes that show up in other aspects. So here's an option to exclude these aspects.",
          ),
      }),
    )
    .query(async (opts) => {
      const isCreator = opts.input.topicCreatorName === opts.ctx.user?.username;

      const topic = await findTopicByUsernameAndTitle(
        isCreator,
        opts.input.topicCreatorName,
        opts.input.topicTitle,
        { nodes: true, edges: true },
      );

      if (!topic) throw new TRPCError({ code: "NOT_FOUND", message: "Topic not found" });

      const nodeToSummarize = await xprisma.node.findFirstOrThrow({
        where: {
          topicId: topic.id,
          text: opts.input.textOfNodeToSummarize,
        },
      });

      return getSummaryForNode(
        nodeToSummarize,
        { nodes: topic.nodes, edges: topic.edges },
        opts.input.includeIncomingOutgoingSummaries,
      );
    }),
  getTopicRefinedForAI: procedure
    .meta({
      description:
        "WARNING: this is not expected to be a stable API, this was quickly thrown together for testing with LLMs",
    })
    .input(
      z.object({
        topicCreatorName: topicSchema.shape.creatorName,
        topicTitle: topicSchema.shape.title,
        includeNodeSummaries: z.boolean().optional().default(false),
        onlyIncludeCoreNodes: z
          .boolean()
          .optional()
          .default(false)
          .describe(
            "If true, only include core nodes. The intent here is that if we're including node summaries for core nodes, we don't need summaries for other nodes right away, and can invoke the `getSummaryForNode` endpoint for a specific node if we want to find out more about that node. NOTE: currently this option doesn't provide a way to find research/justification nodes, since they currently aren't included in node summaries.",
          ),
        includeIncomingOutgoingSummaries: z
          .boolean()
          .optional()
          .default(true)
          .describe(
            "Incoming/outgoing summaries can show relations more precisely (e.g. specific labels like 'has' / 'addresses') and shows some extra nodes (e.g. criteria/neutral-effects for solutions/problems), but the extra nodes might not be useful, and most of these are nodes that show up in other aspects. So here's an option to exclude these aspects.",
          ),
      }),
    )
    .query(async (opts) => {
      if (!opts.input.includeNodeSummaries) {
        if (opts.input.onlyIncludeCoreNodes) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Not supported to only include core nodes if we aren't including node summaries, since there wouldn't be a way to see other nodes",
          });
        }
        if (opts.input.includeIncomingOutgoingSummaries) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Not supported to include incoming/outgoing summaries if we aren't including node summaries, since that doesn't make sense",
          });
        }
      }

      const isCreator = opts.input.topicCreatorName === opts.ctx.user?.username;

      const topic = await findTopicByUsernameAndTitle(
        isCreator,
        opts.input.topicCreatorName,
        opts.input.topicTitle,
        { nodes: true, edges: true },
      );

      if (!topic) throw new TRPCError({ code: "NOT_FOUND", message: "Topic not found" });

      if (opts.input.includeNodeSummaries) {
        return getTopicRefinedForAIWithSummaries({
          nodes: topic.nodes,
          edges: topic.edges,
          onlyIncludeCoreNodes: opts.input.onlyIncludeCoreNodes,
          includeIncomingOutgoingSummaries: opts.input.includeIncomingOutgoingSummaries,
        });
      } else {
        return getTopicRefinedForAIWithoutSummaries({
          nodes: topic.nodes,
          edges: topic.edges,
        });
      }
    }),
});
