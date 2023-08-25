import { findEdge } from "../utils/diagram";
import { nodes } from "../utils/edge";
import { useTopicStore } from "./store";
import { getDiagramOrThrow } from "./utils";

export const useIsNodeSelected = (edgeId: string, diagramId: string) => {
  return useTopicStore((state) => {
    try {
      const diagram = getDiagramOrThrow(state, diagramId);
      const edge = findEdge(edgeId, diagram);
      return nodes(edge, diagram).some((node) => node.selected);
    } catch {
      return false;
    }
  });
};
