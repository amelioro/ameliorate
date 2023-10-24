import { shallow } from "zustand/shallow";

import { useTopicStore } from "./store";
import { isPlaygroundTopic } from "./utils";

export const useOnPlayground = () => {
  return useTopicStore((state) => isPlaygroundTopic(state.topic));
};
export const useTopic = () => {
  return useTopicStore((state) => state.topic, shallow);
};
