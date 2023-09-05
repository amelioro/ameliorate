import { useTopicStore } from "./store";

export const useUserCanEditTopicData = (username?: string) => {
  return useTopicStore((state) => {
    if (!state.topic) return true;
    if (!username) return false;

    return state.topic.creatorName === username;
  });
};
