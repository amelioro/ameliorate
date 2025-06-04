import { NodeType } from "@/common/node";
import { useTopicStore } from "@/web/topic/diagramStore/store";

export const getDefaultNode = (nodeType: NodeType) => {
  const state = useTopicStore.getState();
  return state.nodes.find((node) => node.type === nodeType);
};
