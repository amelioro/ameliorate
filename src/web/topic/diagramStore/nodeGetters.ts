import { NodeType } from "@/common/node";
import { useDiagramStore } from "@/web/topic/diagramStore/store";
import { findNodeOrThrow } from "@/web/topic/utils/graph";
import { neighbors } from "@/web/topic/utils/node";

export const getDefaultNode = (nodeType: NodeType) => {
  const state = useDiagramStore.getState();
  return state.nodes.find((node) => node.type === nodeType);
};

export const getNeighbors = (nodeId: string) => {
  const state = useDiagramStore.getState();

  const node = findNodeOrThrow(nodeId, state.nodes);

  return neighbors(node, state);
};
