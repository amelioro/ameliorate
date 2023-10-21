import { useTopicStore } from "./store";
import { getActiveDiagram } from "./utils";

export const useExplicitClaimCount = (graphPartId: string) => {
  return useTopicStore((state) => {
    const claimTree = state.diagrams[graphPartId];

    if (claimTree === undefined) return 0;

    // there's always one implicit claim (the root node)
    return claimTree.nodes.length - 1;
  });
};

export const useSelectedGraphPart = () => {
  return useTopicStore((state) => {
    const diagram = getActiveDiagram(state);
    return (
      diagram.edges.find((edge) => edge.selected) ?? diagram.nodes.find((node) => node.selected)
    );
  });
};
