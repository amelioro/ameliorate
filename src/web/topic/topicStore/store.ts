import { Topic as ApiTopic } from "@prisma/client";
import { StorageValue, persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

import { errorWithData } from "@/common/errorHandling";
import { apiSyncer } from "@/web/topic/topicStore/apiSyncerMiddleware";
import { isPlaygroundTopic } from "@/web/topic/utils/topic";
import { useReadonlyMode } from "@/web/view/actionConfigStore";

export interface PlaygroundTopic {
  id: undefined; // so we can check this to see if the store topic is a playground topic
  description: string;
}

export type StoreTopic = ApiTopic | PlaygroundTopic;

export interface TopicStoreState {
  topic: StoreTopic;
}

const initialState: TopicStoreState = {
  topic: { id: undefined, description: "" },
};

const topicStoreBaseName = "topic-storage";
const topicStorePlaygroundName = `${topicStoreBaseName}-playground`;

const useTopicStore = createWithEqualityFn<TopicStoreState>()(
  apiSyncer(
    persist(() => initialState, {
      name: topicStorePlaygroundName,
      version: 1,
    }),
  ),
  Object.is,
);

// hooks
export const useOnPlayground = () => {
  return useTopicStore((state) => isPlaygroundTopic(state.topic));
};

export const useTopic = () => {
  return useTopicStore((state) => state.topic, shallow);
};

// util hooks
// TODO: for security, this should probably get the session user rather than assume the username is from the session user
export const useUserCanEditTopicData = (username?: string) => {
  const storeTopic = useTopic();
  const readonlyMode = useReadonlyMode();

  if (readonlyMode) return false;
  if (isPlaygroundTopic(storeTopic)) return true;
  if (!username) return false;
  if (storeTopic.creatorName === username) return true;

  return storeTopic.allowAnyoneToEdit;
};

export const useUserIsCreator = (username?: string) => {
  return useTopicStore((state) => {
    if (isPlaygroundTopic(state.topic)) return true;
    if (!username) return false;

    return state.topic.creatorName === username;
  });
};

// actions
/**
 * For when it's intentional to trigger the apiSyncer
 */
export const setTopicDetails = (description: string) => {
  const state = useTopicStore.getState();

  useTopicStore.setState({ topic: { ...state.topic, description } });
};

export const updateTopicWithoutSyncingToApi = (topic: StoreTopic) => {
  const currentTopic = useTopicStore.getState().topic;

  // Only change topic details in store if we're currently using that topic, e.g. so that topic title and description are updated in app.
  // Otherwise, changing a topic from the user's topic list could set that topic's details on a playground topic, which is undesirable.
  if (topic.id !== currentTopic.id) return;

  useTopicStore.apiSyncer.pause();
  useTopicStore.setState({ topic });
  useTopicStore.apiSyncer.resume();
};

// load actions
export const loadTopicFromApi = (topicData: ApiTopic) => {
  // Ensure we use distinct persistence for topic page compared to playground.
  // Persisting saved-to-db topics allows us to use upload/download with persist migrations.
  useTopicStore.persist.setOptions({ name: `${topicStoreBaseName}-saved-to-db` });

  useTopicStore.apiSyncer.pause();

  useTopicStore.setState(
    {
      // specify each field because we don't need to store extra data like topic's relations if they're passed in
      topic: {
        id: topicData.id,
        title: topicData.title,
        creatorName: topicData.creatorName,
        description: topicData.description,
        visibility: topicData.visibility,
        allowAnyoneToEdit: topicData.allowAnyoneToEdit,
        createdAt: topicData.createdAt,
        updatedAt: topicData.updatedAt,
      },
    },
    true,
  );

  useTopicStore.apiSyncer.resume();
};

export const loadTopicFromLocalStorage = async () => {
  // Ensure we use distinct persistence for topic page compared to playground.
  useTopicStore.persist.setOptions({ name: topicStorePlaygroundName });

  useTopicStore.apiSyncer.pause();

  if (useTopicStore.persist.getOptions().storage?.getItem(topicStorePlaygroundName)) {
    await useTopicStore.persist.rehydrate();
  } else {
    useTopicStore.setState(initialState, true);
  }

  useTopicStore.apiSyncer.resume();
};

// utils
export const getPersistState = () => {
  const persistOptions = useTopicStore.persist.getOptions();
  if (!persistOptions.storage || !persistOptions.name) {
    throw errorWithData("Store persist options missing storage or name", persistOptions);
  }

  return persistOptions.storage.getItem(persistOptions.name) as StorageValue<TopicStoreState>;
};

export const getTopic = () => {
  return useTopicStore.getState().topic;
};

export const isOnPlayground = () => {
  return isPlaygroundTopic(useTopicStore.getState().topic);
};
