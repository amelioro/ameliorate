import { useIsAnyGraphPartSelected } from "../../view/navigateStore";
import { nodes } from "../utils/edge";
import { findEdge } from "../utils/graph";
import { useTopicStore } from "./store";

export const useIsNodeSelected = (edgeId: string) => {
  const neighborNodes = useTopicStore((state) => {
    try {
      const edge = findEdge(edgeId, state.edges);
      return nodes(edge, state.nodes);
    } catch {
      return [];
    }
  });

  return useIsAnyGraphPartSelected(neighborNodes.map((node) => node.id));
};
