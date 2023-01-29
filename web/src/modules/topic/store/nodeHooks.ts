import { findNode } from "../utils/diagram";
import { children } from "../utils/nodes";
import { useDiagramStoreAfterHydration } from "./store";

export const useNode = (nodeId: string, diagramId: string) => {
  return useDiagramStoreAfterHydration((state) => {
    const diagram = state.diagrams[diagramId];
    return findNode(diagram, nodeId);
  });
};

export const useNodeChildren = (nodeId: string, diagramId: string) => {
  return useDiagramStoreAfterHydration((state) => {
    const diagram = state.diagrams[diagramId];
    const node = findNode(diagram, nodeId);

    return children(node, diagram);
  });
};
