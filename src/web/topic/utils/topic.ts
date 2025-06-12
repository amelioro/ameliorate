import { PlaygroundTopic } from "@/common/topic";
import { StoreTopic } from "@/web/topic/topicStore/store";

export const isPlaygroundTopic = (topic: StoreTopic): topic is PlaygroundTopic => {
  return topic.id === undefined;
};
