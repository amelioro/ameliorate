import { Diagram, filterHiddenComponents, findEdge } from "../utils/diagram";
import { isEdgeImplied } from "../utils/edge";
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
