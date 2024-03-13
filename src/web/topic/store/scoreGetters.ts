import get from "lodash/get";

import { Score } from "../utils/graph";
import { getAverageScore } from "../utils/score";
import { UserScores } from "./store";

export const getDisplayScores = (
  graphPartIds: string[],
  perspectives: string[],
  userScores: UserScores
): Record<string, Score> => {
  const perspectiveScoresByGraphPart = getPerspectiveScoresByGraphPart(
    graphPartIds,
    perspectives,
    userScores
  );

  const averagedScoreWithGraphPart = Object.entries(perspectiveScoresByGraphPart).map(
    ([graphPartId, scores]) => [graphPartId, getAverageScore(scores)] as [string, Score]
  );
  return Object.fromEntries(averagedScoreWithGraphPart);
};

const getPerspectiveScoresByGraphPart = (
  graphPartIds: string[],
  perspectives: string[],
  userScores: UserScores
) => {
  const scoresWithGraphPart: [string, Score[]][] = graphPartIds.map((graphPartId) => {
    const perspectiveScores = perspectives.map((perspective) => {
      return get(userScores, [perspective, graphPartId], "-");
    });

    return [graphPartId, perspectiveScores];
  });

  return Object.fromEntries(scoresWithGraphPart);
};
