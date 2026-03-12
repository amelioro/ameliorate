import { shallow } from "zustand/shallow";

import { useDiagramStore } from "@/web/topic/diagramStore/store";
import { nodes } from "@/web/topic/utils/edge";
import { Node, findEdgeOrThrow } from "@/web/topic/utils/graph";

export const useEdge = (edgeId: string | null) => {
  return useDiagramStore((state) => {
    if (!edgeId) return null;

    try {
      return findEdgeOrThrow(edgeId, state.edges);
    } catch {
      return null;
    }
  });
};

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

export const useIsTableEdge = (edgeId: string) => {
  return useDiagramStore((state) => {
    try {
      const edge = findEdgeOrThrow(edgeId, state.edges);
      if (edge.type !== "fulfills") return false;

      const [sourceNode, targetNode] = nodes(edge, state.nodes);
      return sourceNode.type === "solution" && targetNode.type === "criterion";
    } catch {
      return false;
    }
  });
};
