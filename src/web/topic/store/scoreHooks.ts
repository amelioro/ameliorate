import get from "lodash/get";

import { Score } from "../utils/graph";
import { useTopicStore } from "./store";

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
