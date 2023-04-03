import { Diagram, filterHiddenComponents, findEdge } from "../utils/diagram";
import { isEdgeImplied, nodes } from "../utils/edge";
import { useTopicStoreAfterHydration } from "./store";
import { getClaimDiagrams } from "./utils";

export const useIsImplied = (edgeId: string, diagramId: string) => {
  return useTopicStoreAfterHydration((state) => {
    const diagram = state.diagrams[diagramId] as Diagram | undefined;
    if (!diagram) return false;

    try {
      const edge = findEdge(edgeId, diagram);
      const displayDiagram = filterHiddenComponents(diagram, getClaimDiagrams(state), true);
      return isEdgeImplied(edge, displayDiagram, getClaimDiagrams(state));
    } catch {
      return false;
    }
  });
};

export const useIsNodeSelected = (edgeId: string, diagramId: string) => {
  return useTopicStoreAfterHydration((state) => {
    const diagram = state.diagrams[diagramId];

    try {
      const edge = findEdge(edgeId, diagram);
      return nodes(edge, diagram).some((node) => node.selected);
    } catch {
      return false;
    }
  });
};
