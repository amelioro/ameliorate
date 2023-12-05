import { claimRelationNames } from "../../../common/edge";
import { NodeType, claimNodeTypes } from "../../../common/node";
import { isClaimEdge } from "../utils/claim";
import { Node, findGraphPart } from "../utils/graph";
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

export const useTopLevelClaims = (graphPartId: string) => {
  return useTopicStore((state) => {
    const graphPart = findGraphPart(graphPartId, state.nodes, state.edges);
    if (isClaimEdge(graphPart)) return { supports: [], critiques: [] };

    // TODO: cleanup when root claims are removed
    const nodeToCheckForClaims = claimNodeTypes.includes(graphPart.type as NodeType)
      ? graphPart
      : state.nodes.find(
          (node) => node.type === "rootClaim" && node.data.arguedDiagramPartId === graphPartId
        );
    if (!nodeToCheckForClaims) return { supports: [], critiques: [] };

    const topLevelClaimEdges = state.edges.filter(
      (edge) => claimRelationNames.includes(edge.label) && edge.source === nodeToCheckForClaims.id
    );

    const supports = topLevelClaimEdges
      .map((edge) => state.nodes.find((node) => node.id === edge.target && node.type === "support"))
      .filter((node): node is Node => !!node);

    const critiques = topLevelClaimEdges
      .map((edge) =>
        state.nodes.find((node) => node.id === edge.target && node.type === "critique")
      )
      .filter((node): node is Node => !!node);

    return { supports, critiques };
  });
};

export const useNonTopLevelClaimCount = (graphPartId: string) => {
  return useTopicStore((state) => {
    const rootClaim = state.nodes.find(
      (node) => node.type === "rootClaim" && node.data.arguedDiagramPartId === graphPartId
    );
    if (!rootClaim) return 0;

    return state.edges.filter(
      (edge) => edge.data.arguedDiagramPartId === graphPartId && edge.source !== rootClaim.id
    ).length;
  });
};

export const useSelectedGraphPart = () => {
  return useTopicStore((state) => {
    return state.edges.find((edge) => edge.selected) ?? state.nodes.find((node) => node.selected);
  });
};
