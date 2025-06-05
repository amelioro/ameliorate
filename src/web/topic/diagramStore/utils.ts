import { errorWithData } from "@/common/errorHandling";
import { DiagramStoreState } from "@/web/topic/diagramStore/store";

export const getTopicTitleFromNodes = (state: DiagramStoreState) => {
  const rootNode = state.nodes[0];
  if (!rootNode) throw errorWithData("diagram has no root node", state.nodes);

  return rootNode.data.label;
};
