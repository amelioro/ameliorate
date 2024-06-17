import get from "lodash/get";

import { UserScores } from "@/web/topic/store/store";
import { Score } from "@/web/topic/utils/graph";
import { getAverageScore } from "@/web/topic/utils/score";

export const getDisplayScoresByGraphPartId = (
  graphPartIds: string[],
  perspectives: string[],
  userScores: UserScores,
): Record<string, Score> => {
  const perspectiveScoresByGraphPart = getPerspectiveScoresByGraphPart(
    graphPartIds,
    perspectives,
    userScores,
  );

  const averagedScoreWithGraphPart = Object.entries(perspectiveScoresByGraphPart).map(
    ([graphPartId, scores]) => [graphPartId, getAverageScore(scores)] as [string, Score],
  );
  return Object.fromEntries(averagedScoreWithGraphPart);
};

const getPerspectiveScoresByGraphPart = (
  graphPartIds: string[],
  perspectives: string[],
  userScores: UserScores,
) => {
  const scoresWithGraphPart: [string, Score[]][] = graphPartIds.map((graphPartId) => {
    const perspectiveScores = perspectives.map((perspective) => {
      return get(userScores, [perspective, graphPartId], "-");
    });

    return [graphPartId, perspectiveScores];
  });

  return Object.fromEntries(scoresWithGraphPart);
};
