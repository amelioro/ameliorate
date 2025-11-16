import { shallow } from "zustand/shallow";

import { useDiagramStore } from "@/web/topic/diagramStore/store";
import { nodes } from "@/web/topic/utils/edge";
import { Node, findEdgeOrThrow } from "@/web/topic/utils/graph";
import { useIsAnyGraphPartSelected } from "@/web/view/selectedPartStore";

export const useEdgeNodes = (edgeId: string): [Node, Node] | [] => {
  return useDiagramStore((state) => {
    try {
      const edge = findEdgeOrThrow(edgeId, state.edges);
      return nodes(edge, state.nodes);
    } catch {
      return [];
    }
  }, shallow);
};

export const useIsNodeSelected = (edgeId: string) => {
  const neighborNodes = useEdgeNodes(edgeId);
  return useIsAnyGraphPartSelected(neighborNodes.map((node) => node.id));
};

export const useIsTableEdge = (edgeId: string) => {
  return useDiagramStore((state) => {
    try {
      const edge = findEdgeOrThrow(edgeId, state.edges);
      if (edge.label !== "fulfills") return false;

      const [sourceNode, targetNode] = nodes(edge, state.nodes);
      return sourceNode.type === "criterion" && targetNode.type === "solution";
    } catch {
      return false;
    }
  });
};
