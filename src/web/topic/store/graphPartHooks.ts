import { claimNodeTypes } from "../../../common/node";
import { useTopicStore } from "./store";
import { getActiveDiagram } from "./utils";

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
    const diagram = getActiveDiagram(state);
    return (
      diagram.edges.find((edge) => edge.selected) ?? diagram.nodes.find((node) => node.selected)
    );
  });
};
