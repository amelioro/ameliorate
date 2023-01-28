import { findNode } from "../utils/diagram";
import { children } from "../utils/nodes";
import { useDiagramStoreAfterHydration } from "./store";

export const useNode = (nodeId: string) => {
  return useDiagramStoreAfterHydration((state) => {
    const activeDiagram = state.diagrams[state.activeDiagramId];
    return findNode(activeDiagram, nodeId);
  });
};

export const useNodeChildren = (nodeId: string) => {
  return useDiagramStoreAfterHydration((state) => {
    const activeDiagram = state.diagrams[state.activeDiagramId];
    const node = findNode(activeDiagram, nodeId);

    return children(node, activeDiagram);
  });
};
