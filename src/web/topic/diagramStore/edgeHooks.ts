import { shallow } from "zustand/shallow";

import { useDiagramStore } from "@/web/topic/diagramStore/store";
import { nodes } from "@/web/topic/utils/edge";
import { findEdgeOrThrow } from "@/web/topic/utils/graph";
import { useIsAnyGraphPartSelected } from "@/web/view/selectedPartStore";

export const useIsNodeSelected = (edgeId: string) => {
  const neighborNodes = useDiagramStore((state) => {
    try {
      const edge = findEdgeOrThrow(edgeId, state.edges);
      return nodes(edge, state.nodes);
    } catch {
      return [];
    }
  }, shallow);

  return useIsAnyGraphPartSelected(neighborNodes.map((node) => node.id));
};

export const useIsTableEdge = (edgeId: string) => {
  return useDiagramStore((state) => {
    try {
      const edge = findEdgeOrThrow(edgeId, state.edges);
      if (edge.label !== "fulfills") return false;

      const [parentNode, childNode] = nodes(edge, state.nodes);
      return parentNode.type === "criterion" && childNode.type === "solution";
    } catch {
      return false;
    }
  });
};
