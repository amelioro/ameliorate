import { z } from "zod";

import { NodeType, zNodeTypes } from "@/common/node";
import { GraphPart, Node, Score, possibleScores } from "@/web/topic/utils/graph";
import { getNumericScore } from "@/web/topic/utils/score";

export const scoredComparers = ["≥", ">", "≤", "<", "="] as const;
const zScoredComparers = z.enum(scoredComparers);
export type ScoredComparer = z.infer<typeof zScoredComparers>;

export const generalFilterSchema = z.object({
  nodeTypes: zNodeTypes.array(),
  showOnlyScored: z.boolean(),
  scoredComparer: zScoredComparers,
  scoreToCompare: z.enum(possibleScores),
  nodesToShow: z.string().uuid().array(),
  nodesToHide: z.string().uuid().array(),
  showSecondaryResearch: z.boolean(),
  showSecondaryStructure: z.boolean(),
});

export type GeneralFilter = z.infer<typeof generalFilterSchema>;

export const applyNodeTypeFilter = (nodes: Node[], nodeTypes: NodeType[]) => {
  return nodeTypes.length > 0 ? nodes.filter((node) => nodeTypes.includes(node.type)) : nodes;
};

export const applyScoreFilter = <T extends GraphPart>(
  graphParts: T[],
  filter: GeneralFilter,
  scores: Record<string, Score>
) => {
  const { showOnlyScored, scoredComparer, scoreToCompare } = filter;
  if (!showOnlyScored) return graphParts;

  return graphParts.filter((graphPart) => {
    const score = scores[graphPart.id] ?? "-";
    if (scoredComparer === "=") return score === scoreToCompare;

    const numericScore = getNumericScore(score);
    const numericScoreToCompare = getNumericScore(scoreToCompare);

    if (scoredComparer === "≥") return numericScore >= numericScoreToCompare;
    if (scoredComparer === ">") return numericScore > numericScoreToCompare;
    if (scoredComparer === "≤") return numericScore <= numericScoreToCompare;
    return numericScore < numericScoreToCompare;
  });
};
