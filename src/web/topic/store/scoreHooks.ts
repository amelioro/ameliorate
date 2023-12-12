import get from "lodash/get";

import { usePerspectives } from "../../view/perspectiveStore";
import { Score } from "../utils/graph";
import { getAverageScore } from "../utils/score";
import { useTopicStore } from "./store";

export const useDisplayScoresByGraphPart = (graphPartIds: string[]) => {
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
  });
};

export const useScoringUsernames = () => {
  return useTopicStore((state) => {
    return Object.keys(state.userScores);
  });
};
