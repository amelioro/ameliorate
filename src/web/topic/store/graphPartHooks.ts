import { claimNodeTypes } from "../../../common/node";
import { useTopicStore } from "./store";

export const useExplicitClaimCount = (graphPartId: string) => {
  return useTopicStore((state) => {
    return state.nodes.filter(
      (node) =>
        claimNodeTypes.includes(node.type) &&
        node.type !== "rootClaim" &&
        node.data.arguedDiagramPartId === graphPartId
    ).length;
  });
};

export const useSelectedGraphPart = () => {
  return useTopicStore((state) => {
    return state.edges.find((edge) => edge.selected) ?? state.nodes.find((node) => node.selected);
  });
};
