import { get } from "lodash";

import { useTopicStore } from "./store";

export const useExplicitClaimCount = (graphPartId: string) => {
  return useTopicStore((state) => {
    const claimTree = state.diagrams[graphPartId];

    if (claimTree === undefined) return 0;

    // there's always one implicit claim (the root node)
    return claimTree.nodes.length - 1;
  });
};

export const useUserScore = (graphPartId: string, username?: string) => {
  return useTopicStore((state) => {
    if (!username) return undefined;

    return get(state.userScores, [username, graphPartId], undefined);
  });
};
