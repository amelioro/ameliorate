import { NodeType } from "@/common/node";
import { useDiagramStore } from "@/web/topic/diagramStore/store";

export const getDefaultNode = (nodeType: NodeType) => {
  const state = useDiagramStore.getState();
  return state.nodes.find((node) => node.type === nodeType);
};
