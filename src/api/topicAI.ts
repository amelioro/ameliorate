import { readFileSync } from "fs";
import path from "path";

import { z } from "zod";

import { Edge, justificationRelationNames, topicAIEdgeSchema } from "@/common/edge";
import { Node, justificationNodeTypes, topicAINodeSchema } from "@/common/node";
import { topicFileSchema } from "@/common/topic";
import { getAspectNodes } from "@/web/summary/aspectFilter";
import { type Aspect, getAspectsForNodeType } from "@/web/summary/summary";
import { convertToStoreEdge, convertToStoreNode } from "@/web/topic/utils/apiConversion";
import { type Node as WebNode } from "@/web/topic/utils/graph";
import unrefinedVisibleAct from "~/examples/visible_act.json";

export const topicAICreatePartsSchema = z.object({
  nodesToCreate: z.array(topicAINodeSchema),
  edgesToCreate: z.array(topicAIEdgeSchema),
});

type TopicAICreateParts = z.infer<typeof topicAICreatePartsSchema>;

const _topicAIPartsWithoutSummariesSchema = z.object({
  nodes: z.array(topicAINodeSchema),
  edges: z.array(topicAIEdgeSchema),
});

type TopicAIPartsWithoutSummaries = z.infer<typeof _topicAIPartsWithoutSummariesSchema>;

const _topicAIPartsWithSummariesSchema = z.object({
  nodes: z.array(topicAINodeSchema.omit({ tempId: true })),
});

type TopicAIPartsWithSummaries = z.infer<typeof _topicAIPartsWithSummariesSchema>;

export const visibleActSourceText = readFileSync(
  path.join(process.cwd(), "examples", "visible_act.source.txt"),
  "utf-8",
);

/**
 * Could make a variable out of this so it doesn't need to be re-run on every call, but it doesn't
 * seem like a big deal for now.
 */
export const getRefinedVisibleAct = () => {
  const parsedVisibleAct = topicFileSchema.parse(unrefinedVisibleAct);

  // eslint-disable-next-line functional/no-let
  let tempIdCounter = 0;
  const tempNodeIds: Record<string, number> = {};

  const refinedVisibleAct: TopicAICreateParts = {
    nodesToCreate: parsedVisibleAct.diagram.state.nodes
      // TODO: remove `rootClaim` nodes so it's easier for an AI to use justification properly
      .filter((node) => !justificationNodeTypes.includes(node.type))
      .map((node) => {
        const tempId = tempIdCounter++;
        // eslint-disable-next-line functional/immutable-data
        tempNodeIds[node.id] = tempId;

        return {
          tempId,
          type: node.type,
          text: node.data.label,
          notes: node.data.notes,
        };
      }),
    edgesToCreate: parsedVisibleAct.diagram.state.edges
      // TODO: remove `rootClaim` nodes so it's easier for an AI to use justification properly
      .filter((edge) => !justificationRelationNames.includes(edge.label))
      .map((edge) => {
        const tempSourceId = tempNodeIds[edge.source];
        const tempTargetId = tempNodeIds[edge.target];
        if (tempSourceId === undefined || tempTargetId === undefined)
          throw new Error("Failed to refine visible act: couldn't find source/target nodes");

        return {
          type: edge.label,
          notes: edge.data.notes,
          tempSourceId,
          tempTargetId,
        };
      }),
  };

  return refinedVisibleAct;
};

const formatNode = (node: WebNode) => {
  return `${node.type}: ${node.data.label}`;
};

const formatNodeWithRelationDescription = (node: WebNode, relationDescription: string) => {
  return `(${relationDescription}) ` + formatNode(node);
};

/**
 * JANK WARNING: we're referencing front web/ files summary.ts and aspectFilter.ts from back api/,
 * which is bad design.
 *
 * Ideally these graph utils should be refactored to be in common/, but I think
 * that's a larger refactor than I want to do right now.
 *
 * As a consolation, I at least tried to ensure summary/aspectFilter don't import any component code.
 *
 * Summary looks like this:
 * ```
 * {
 *   "incoming": ["(impedes this Solution) Obstacle: street is a thoroughfare"],
 *   "outgoing": ["(this Solution addresses) Problem: cars going too fast in neighborhood"],
 *   "motivation": ["(direct) Problem: cars going too fast in neighborhood", "(indirect) Cause: street goes downhill"],
 * }
 * ```
 */
export const getSummaryForNode = (
  node: Node,
  graph: { nodes: Node[]; edges: Edge[] },
  includeIncomingOutgoingSummaries: boolean,
) => {
  const aspects = getAspectsForNodeType(node.type);

  // jank because we're using web/ methods which use a frontend-specific format
  const webNode: WebNode = convertToStoreNode(node);
  const webGraph = {
    nodes: graph.nodes.map(convertToStoreNode),
    edges: graph.edges.map(convertToStoreEdge),
  };

  const aspectsToInclude = includeIncomingOutgoingSummaries
    ? aspects
    : aspects.filter((aspect) => !["incoming", "outgoing"].includes(aspect));

  const summary: Partial<Record<Aspect, string[]>> = Object.fromEntries(
    aspectsToInclude.map((aspect) => {
      const { directNodes, indirectNodes, nodesByRelationDescription } = getAspectNodes(
        webNode,
        webGraph,
        aspect,
      );

      if (directNodes) {
        const formattedDirectNodes = directNodes.map((node) => `(direct) ${formatNode(node)}`);
        const formattedIndirectNodes = indirectNodes.map(
          (node) => `(indirect) ${formatNode(node)}`,
        );
        const formattedNodes = [...formattedDirectNodes, ...formattedIndirectNodes];

        return [aspect, formattedNodes] as [Aspect, string[]];
      } else {
        const formattedNodes = Object.entries(nodesByRelationDescription).flatMap(
          ([relationDescription, nodes]) => {
            return nodes.map((node) =>
              formatNodeWithRelationDescription(node, relationDescription),
            );
          },
        );

        return [aspect, formattedNodes] as [Aspect, string[]];
      }
    }),
    // could filter out empty aspects, but it does seem a little nice to see explicitly that a node doesn't have anything for a given aspect
    // .filter(([_, nodes]) => nodes.length > 0),
  );

  return summary;
};

interface TopicRefinedForAIProps {
  nodes: Node[];
  edges: Edge[];
  onlyIncludeCoreNodes: boolean;
  includeIncomingOutgoingSummaries: boolean;
}

export const getTopicRefinedForAIWithSummaries = ({
  nodes,
  edges,
  onlyIncludeCoreNodes,
  includeIncomingOutgoingSummaries,
}: TopicRefinedForAIProps) => {
  const nodesToUse = onlyIncludeCoreNodes
    ? nodes.filter((node) => node.type === "problem" || node.type === "solution")
    : nodes;

  const refinedNodes: TopicAIPartsWithSummaries["nodes"] = nodesToUse.map((node) => {
    return {
      type: node.type,
      text: node.text,
      notes: node.notes,
      summary: getSummaryForNode(node, { nodes, edges }, includeIncomingOutgoingSummaries),
    };
  });

  return { nodes: refinedNodes };
};

interface TopicRefinedForAIWithoutSummariesProps {
  nodes: Node[];
  edges: Edge[];
}

export const getTopicRefinedForAIWithoutSummaries = ({
  nodes,
  edges,
}: TopicRefinedForAIWithoutSummariesProps) => {
  // eslint-disable-next-line functional/no-let
  let tempIdCounter = 0;
  const tempNodeIds: Record<string, number> = {};

  const refinedNodes: TopicAIPartsWithoutSummaries["nodes"] = nodes.map((node) => {
    const tempId = tempIdCounter++;
    // eslint-disable-next-line functional/immutable-data
    tempNodeIds[node.id] = tempId;

    return {
      tempId,
      type: node.type,
      text: node.text,
      notes: node.notes,
    };
  });

  const refinedEdges: TopicAIPartsWithoutSummaries["edges"] = edges.map((edge) => {
    const tempSourceId = tempNodeIds[edge.sourceId];
    const tempTargetId = tempNodeIds[edge.targetId];
    if (tempSourceId === undefined || tempTargetId === undefined)
      throw new Error("Failed to refine topic: couldn't find source/target nodes");

    return {
      type: edge.type,
      notes: edge.notes,
      tempSourceId,
      tempTargetId,
    };
  });

  return { nodes: refinedNodes, edges: refinedEdges };
};
