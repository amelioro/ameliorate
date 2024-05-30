import { createDraft, finishDraft } from "immer";

import { useTopicStore } from "@/web/topic/store/store";

export const setTopicDetails = (description: string) => {
  const state = createDraft(useTopicStore.getState());

  // eslint-disable-next-line functional/immutable-data
  state.topic.description = description;

  useTopicStore.setState(finishDraft(state), false, "setTopicDetails");
};
