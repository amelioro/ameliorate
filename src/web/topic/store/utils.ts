import { errorWithData } from "@/common/errorHandling";
import { PlaygroundTopic, StoreTopic, TopicStoreState } from "@/web/topic/store/store";

export const getTopicTitle = (state: TopicStoreState) => {
  const rootNode = state.nodes[0];
  if (!rootNode) throw errorWithData("diagram has no root node", state.nodes);

  return rootNode.data.label;
};

export const isPlaygroundTopic = (topic: StoreTopic): topic is PlaygroundTopic => {
  return topic.id === undefined;
};
