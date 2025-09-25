import { readFileSync } from "fs";
import path from "path";

import { z } from "zod";

import { justificationRelationNames, topicAIEdgeSchema } from "@/common/edge";
import { justificationNodeTypes, topicAINodeSchema } from "@/common/node";
import { topicFileSchema } from "@/common/topic";
import unrefinedVisibleAct from "~/examples/visible_act.json";

export const topicAICreatePartsSchema = z.object({
  nodesToCreate: z.array(topicAINodeSchema),
  edgesToCreate: z.array(topicAIEdgeSchema),
});

type TopicAICreateParts = z.infer<typeof topicAICreatePartsSchema>;

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
