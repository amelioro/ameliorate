import compact from "lodash/compact";
import get from "lodash/get";
import sum from "lodash/sum";
import { shallow } from "zustand/shallow";

import { throwError } from "../../../common/errorHandling";
import { usePerspectives } from "../../view/perspectiveStore";
import { Node, Score } from "../utils/graph";
import { children, edges } from "../utils/node";
import { getAverageScore, getNumericScore } from "../utils/score";
import { useTopicStore } from "./store";

export const useDisplayScoresByGraphPart = (graphPartIds: string[]): Record<string, Score> => {
  const perspectives = usePerspectives();

  const userScoresByGraphPart = useUserScoresByGraphPart(graphPartIds, perspectives);

  const averagedScoreWithGraphPart = Object.entries(userScoresByGraphPart).map(
    ([graphPartId, scores]) => [graphPartId, getAverageScore(scores)] as [string, Score]
  );
  return Object.fromEntries(averagedScoreWithGraphPart);
};

const useUserScoresByGraphPart = (graphPartIds: string[], perspectives: string[]) => {
  return useTopicStore((state) => {
    const scoresWithGraphPart: [string, Score[]][] = graphPartIds.map((graphPartId) => {
      const userScores = perspectives.map((perspective) => {
        return get(state.userScores, [perspective, graphPartId], "-");
      });

      return [graphPartId, userScores];
    });

    return Object.fromEntries(scoresWithGraphPart);
  });
};

export const useUserScores = (graphPartId: string, perspectives: string[]) => {
  return useTopicStore((state) => {
    const userScores: [string, Score][] = perspectives.map((perspective) => [
      perspective,
      get(state.userScores, [perspective, graphPartId], "-"),
    ]);

    return Object.fromEntries(userScores);
  }, shallow);
};

export const useScoringUsernames = () => {
  return useTopicStore((state) => {
    return Object.keys(state.userScores);
  });
};

export const useSolutionTotal = (solution: Node, problem: Node) => {
  const criteriaSolutionEdges = useTopicStore((state) => {
    const topicGraph = { nodes: state.nodes, edges: state.edges };
    const criteriaForProblem = children(problem, topicGraph).filter(
      (node) => node.type === "criterion"
    );
    const criteriaSolutionEdges = compact(
      criteriaForProblem.map((criterion) =>
        edges(criterion, state.edges).find((edge) => edge.target === solution.id)
      )
    );

    return criteriaSolutionEdges;
  });

  const graphPartIds = criteriaSolutionEdges.flatMap((edge) => [edge.id, edge.source]);
  const scores = useDisplayScoresByGraphPart(graphPartIds);

  return sum(
    criteriaSolutionEdges.map((edge) => {
      const edgeScore = scores[edge.id] ?? throwError(`No score found for edge ${edge.id}`);
      const criterionScore =
        scores[edge.source] ?? throwError(`No score found for criterion ${edge.source}`);

      // use a (-4,4) range for the edge because low means doesn't embody, high means does
      // use a (0,8) range for the criterion because it's just importance, and should therefore just increase/decrease emphasis of the edge score
      return (getNumericScore(edgeScore) - 5) * (getNumericScore(criterionScore) - 1);
    })
  );
};
