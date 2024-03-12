import { NodeType } from "../../../common/node";
import { useTopicStore } from "./store";

export const getNodes = (nodeType: NodeType) => {
  const state = useTopicStore.getState();

  return state.nodes.filter((node) => node.type === nodeType);
};
