import { useTopicStore } from "./store";

export const useUserCanEditTopicData = (userId?: number) => {
  return useTopicStore((state) => {
    if (!state.topic) return true;
    if (!userId) return false;

    return state.topic.creatorId === userId;
  });
};
