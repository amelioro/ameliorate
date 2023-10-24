import { useTopicStore } from "./store";
import { isPlaygroundTopic } from "./utils";

export const useOnPlayground = () => {
  return useTopicStore((state) => isPlaygroundTopic(state.topic));
};
