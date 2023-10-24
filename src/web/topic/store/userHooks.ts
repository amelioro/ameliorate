import { useTopicStore } from "./store";
import { isPlaygroundTopic } from "./utils";

export const useUserCanEditTopicData = (username?: string) => {
  return useTopicStore((state) => {
    if (isPlaygroundTopic(state.topic)) return true;
    if (!username) return false;

    return state.topic.creatorName === username;
  });
};
