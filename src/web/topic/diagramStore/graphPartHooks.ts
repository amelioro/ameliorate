import { shallow } from "zustand/shallow";

import { justificationRelationNames } from "@/common/edge";
import { NodeType, justificationNodeTypes, researchNodeTypes } from "@/common/node";
import { deepIsEqual } from "@/common/utils";
import { DiagramStoreState, useDiagramStore } from "@/web/topic/diagramStore/store";
import { Node } from "@/web/topic/utils/graph";
import { isJustificationEdge } from "@/web/topic/utils/justification";

export const useRootClaim = (graphPartId: string) => {
  return useDiagramStore((state) => {
    return state.nodes.find(
      (node) => node.type === "rootClaim" && node.data.arguedDiagramPartId === graphPartId,
    );
  }, shallow);
};

export const getJustificationCount = (state: DiagramStoreState, graphPartId: string) => {
  return state.nodes.filter(
    (node) =>
      justificationNodeTypes.includes(node.type) &&
      node.type !== "rootClaim" &&
      node.data.arguedDiagramPartId === graphPartId,
  ).length;
};

export const useJustificationCount = (graphPartId: string) => {
  return useDiagramStore((state) => getJustificationCount(state, graphPartId));
};

export const useTopLevelJustification = (graphPartId: string) => {
  return useDiagramStore((state) => {
    const graphPart = [...state.nodes, ...state.edges].find((part) => part.id === graphPartId);
    if (!graphPart || isJustificationEdge(graphPart)) return { supports: [], critiques: [] };

    // TODO: cleanup when root claims are removed
    const nodeToCheckForJustification = justificationNodeTypes.includes(graphPart.type as NodeType)
      ? graphPart
      : state.nodes.find(
          (node) => node.type === "rootClaim" && node.data.arguedDiagramPartId === graphPartId,
        );
    if (!nodeToCheckForJustification) return { supports: [], critiques: [] };

    const topLevelJustificationEdges = state.edges.filter(
      (edge) =>
        justificationRelationNames.includes(edge.label) &&
        edge.source === nodeToCheckForJustification.id,
    );

    const supports = topLevelJustificationEdges
      .map((edge) => state.nodes.find((node) => node.id === edge.target && node.type === "support"))
      .filter((node): node is Node => !!node);

    const critiques = topLevelJustificationEdges
      .map((edge) =>
        state.nodes.find((node) => node.id === edge.target && node.type === "critique"),
      )
      .filter((node): node is Node => !!node);

    return { supports, critiques };
  }, deepIsEqual);
};

export const useNonTopLevelJustificationCount = (graphPartId: string) => {
  return useDiagramStore((state) => {
    const rootClaim = state.nodes.find(
      (node) => node.type === "rootClaim" && node.data.arguedDiagramPartId === graphPartId,
    );
    if (!rootClaim) return 0;

    return state.edges.filter(
      (edge) => edge.data.arguedDiagramPartId === graphPartId && edge.source !== rootClaim.id,
    ).length;
  });
};

export const useResearchNodes = (graphPartId: string) => {
  return useDiagramStore((state) => {
    const researchNodes = state.nodes.filter(
      (node) =>
        researchNodeTypes.includes(node.type) &&
        state.edges.find((edge) => edge.source === graphPartId && edge.target === node.id),
    );

    return {
      questions: researchNodes.filter((node) => node.type === "question"),
      facts: researchNodes.filter((node) => node.type === "fact"),
      sources: researchNodes.filter((node) => node.type === "source"),
    };
  }, deepIsEqual);
};

export const useGraphPart = (graphPartId: string | null) => {
  return useDiagramStore((state) => {
    if (!graphPartId) return null;

    return getGraphPart(graphPartId, state);
  });
};

export const getGraphPart = (graphPartId: string, storeState?: DiagramStoreState) => {
  const state = storeState ?? useDiagramStore.getState();

  return (
    state.edges.find((edge) => edge.id === graphPartId) ??
    state.nodes.find((node) => node.id === graphPartId) ??
    null
  );
};
