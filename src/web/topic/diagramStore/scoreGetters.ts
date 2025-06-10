import { get } from "es-toolkit/compat";

import { UserScores } from "@/web/topic/diagramStore/store";
import { Score } from "@/web/topic/utils/graph";
import { AggregationMode, getDisplayScore } from "@/web/topic/utils/score";

export const getDisplayScoresByGraphPartId = (
  graphPartIds: string[],
  perspectives: string[],
  userScores: UserScores,
  aggregationMode: AggregationMode,
): Record<string, Score> => {
  const perspectiveScoresByGraphPart = getPerspectiveScoresByGraphPart(
    graphPartIds,
    perspectives,
    userScores,
  );

  const displayScoresWithGraphParts = Object.entries(perspectiveScoresByGraphPart).map(
    ([graphPartId, scores]) =>
      [graphPartId, getDisplayScore(scores, aggregationMode)] as [string, Score],
  );
  return Object.fromEntries(displayScoresWithGraphParts);
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
