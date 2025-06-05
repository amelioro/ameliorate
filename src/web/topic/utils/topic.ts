import { PlaygroundTopic, StoreTopic } from "@/web/topic/topicStore/store";

export const isPlaygroundTopic = (topic: StoreTopic): topic is PlaygroundTopic => {
  return topic.id === undefined;
};
