import { z } from "zod";

import { NodeType, zNodeTypes } from "../../../common/node";
import { GraphPart, Node, Score, possibleScores } from "../../topic/utils/graph";
import { getNumericScore } from "../../topic/utils/score";

export const scoredComparers = ["≥", ">", "≤", "<", "="] as const;
const zScoredComparers = z.enum(scoredComparers);
export type ScoredComparer = z.infer<typeof zScoredComparers>;

export const generalFilterSchema = z.object({
  nodeTypes: zNodeTypes.array(),
  showOnlyScored: z.boolean(),
  scoredComparer: zScoredComparers,
  scoreToCompare: z.enum(possibleScores),
  showSecondaryResearch: z.boolean(),
  showSecondaryStructure: z.boolean(),
});

export type GeneralFilter = z.infer<typeof generalFilterSchema>;

export const applyNodeTypeFilter = (nodes: Node[], nodeTypes: NodeType[]) => {
  return nodes.filter((node) => nodeTypes.includes(node.type));
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
