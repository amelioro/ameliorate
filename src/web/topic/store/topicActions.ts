import { Topic as ApiTopic } from "@prisma/client";
import { createDraft, finishDraft } from "immer";

import { useTopicStore } from "@/web/topic/store/store";

export const setTopicDetails = (description: string) => {
  const state = createDraft(useTopicStore.getState());

  // eslint-disable-next-line functional/immutable-data
  state.topic.description = description;

  useTopicStore.setState(finishDraft(state), false, "setTopicDetails");
};

export const updateTopic = (topic: ApiTopic) => {
  const currentTopic = useTopicStore.getState().topic;

  // Only change topic details in store if we're currently using that topic, e.g. so that topic title and description are updated in app.
  // Otherwise, changing a topic from the user's topic list could set that topic's details on a playground topic, which is undesirable.
  if (topic.id !== currentTopic.id) return;

  useTopicStore.setState({ topic }, false, "updateTopic");
};
