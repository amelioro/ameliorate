import { compact, sum } from "es-toolkit";
import { get } from "es-toolkit/compat";
import { shallow } from "zustand/shallow";

import { throwError } from "@/common/errorHandling";
import { getDisplayScoresByGraphPartId } from "@/web/topic/diagramStore/scoreGetters";
import { useDiagramStore } from "@/web/topic/diagramStore/store";
import { Node, Score } from "@/web/topic/utils/graph";
import { edges, sourceNodes } from "@/web/topic/utils/node";
import { ScoreMeaning, getNumericScore, getScoreMeaning } from "@/web/topic/utils/score";
import { useAggregationMode, usePerspectives } from "@/web/view/perspectiveStore";

export const useDisplayScores = (
  graphPartIds: string[],
): { scoresByGraphPartId: Record<string, Score>; scoreMeaning: ScoreMeaning } => {
  const perspectives = usePerspectives();
  const aggregationMode = useAggregationMode();
  const scoreMeaning = getScoreMeaning(perspectives.length, aggregationMode);

  return useDiagramStore(
    (state) => ({
      scoresByGraphPartId: getDisplayScoresByGraphPartId(
        graphPartIds,
        perspectives,
        state.userScores,
        aggregationMode,
      ),
      scoreMeaning,
    }),
    shallow,
  );
};

export const useUserScores = (graphPartId: string, perspectives: string[]) => {
  return useDiagramStore((state) => {
    const userScores: [string, Score][] = perspectives.map((perspective) => [
      perspective,
      get(state.userScores, [perspective, graphPartId], "-"),
    ]);

    return Object.fromEntries(userScores);
  }, shallow);
};

export const useScoringUsernames = () => {
  return useDiagramStore((state) => {
    return Object.keys(state.userScores);
  });
};

export const useSolutionTotal = (solution: Node, problem: Node) => {
  const criteriaSolutionEdges = useDiagramStore((state) => {
    const topicGraph = { nodes: state.nodes, edges: state.edges };
    const criteriaForProblem = sourceNodes(problem, topicGraph).filter(
      (node) => node.type === "criterion",
    );
    const criteriaSolutionEdges = compact(
      criteriaForProblem.map((criterion) =>
        edges(criterion, state.edges).find((edge) => edge.source === solution.id),
      ),
    );

    return criteriaSolutionEdges;
  });

  const graphPartIds = criteriaSolutionEdges.flatMap((edge) => [edge.id, edge.target]);
  const { scoresByGraphPartId: scores } = useDisplayScores(graphPartIds);

  return sum(
    criteriaSolutionEdges.map((edge) => {
      const edgeScore = scores[edge.id] ?? throwError(`No score found for edge ${edge.id}`);
      const criterionScore =
        scores[edge.target] ?? throwError(`No score found for criterion ${edge.target}`);

      // use a (-4,4) range for the edge because low means doesn't embody, high means does
      // use a (0,8) range for the criterion because it's just importance, and should therefore just increase/decrease emphasis of the edge score
      return (getNumericScore(edgeScore) - 5) * (getNumericScore(criterionScore) - 1);
    }),
  );
};
