import { findNode } from "../utils/diagram";
import { children } from "../utils/nodes";
import { useDiagramStoreAfterHydration } from "./store";

export const useNode = (nodeId: string, diagramId: string) => {
  return useDiagramStoreAfterHydration((state) => {
    const diagram = state.diagrams[diagramId];

    // wrap in try/catch because findNode will error when useNode is triggered by a node deletion (zombie child issue)
    try {
      return findNode(diagram, nodeId);
    } catch {
      return null;
    }
  });
};

export const useNodeChildren = (nodeId: string, diagramId: string) => {
  return useDiagramStoreAfterHydration((state) => {
    const diagram = state.diagrams[diagramId];

    // wrap in try/catch because findNode will error when useNode is triggered by a node deletion (zombie child issue)
    try {
      const node = findNode(diagram, nodeId);
      return children(node, diagram);
    } catch {
      return [];
    }
  });
};
