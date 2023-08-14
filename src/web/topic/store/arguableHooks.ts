import { useTopicStore } from "./store";
import { getActiveDiagram } from "./utils";

export const useExplicitClaimCount = (arguableId: string) => {
  return useTopicStore((state) => {
    const claimTree = state.diagrams[arguableId];

    // consider setting noUncheckedIndexedAccess because this _can_ be undefined
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (claimTree === undefined) return 0;

    // there's always one implicit claim (the root node)
    return claimTree.nodes.length - 1;
  });
};

export const useIsAnyArguableSelected = () => {
  return useTopicStore((state) => {
    const activeDiagram = getActiveDiagram(state);
    return [...activeDiagram.nodes, ...activeDiagram.edges].some((arguable) => arguable.selected);
  });
};
