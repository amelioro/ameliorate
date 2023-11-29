import { findEdge } from "../utils/diagram";
import { nodes } from "../utils/edge";
import { useTopicStore } from "./store";

export const useIsNodeSelected = (edgeId: string) => {
  return useTopicStore((state) => {
    try {
      const edge = findEdge(edgeId, state.edges);
      return nodes(edge, state.nodes).some((node) => node.selected);
    } catch {
      return false;
    }
  });
};
