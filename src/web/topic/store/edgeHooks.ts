import { shallow } from "zustand/shallow";

import { useTopicStore } from "@/web/topic/store/store";
import { nodes } from "@/web/topic/utils/edge";
import { findEdgeOrThrow } from "@/web/topic/utils/graph";
import { useIsAnyGraphPartSelected } from "@/web/view/currentViewStore/store";

export const useIsNodeSelected = (edgeId: string) => {
  const neighborNodes = useTopicStore((state) => {
    try {
      const edge = findEdgeOrThrow(edgeId, state.edges);
      return nodes(edge, state.nodes);
    } catch {
      return [];
    }
  }, shallow);

  return useIsAnyGraphPartSelected(neighborNodes.map((node) => node.id));
};
