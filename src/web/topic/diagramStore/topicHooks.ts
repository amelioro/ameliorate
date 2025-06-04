import { shallow } from "zustand/shallow";

import { useTopicStore } from "@/web/topic/diagramStore/store";
import { isPlaygroundTopic } from "@/web/topic/diagramStore/utils";

export const useOnPlayground = () => {
  return useTopicStore((state) => isPlaygroundTopic(state.topic));
};
export const useTopic = () => {
  return useTopicStore((state) => state.topic, shallow);
};
