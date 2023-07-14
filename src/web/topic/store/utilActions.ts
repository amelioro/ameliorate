import { StorageValue } from "zustand/middleware";

import { errorWithData } from "../../common/errorHandling";
import { TopicStoreState, initialState, useTopicStore } from "./store";

export const getPersistState = () => {
  const persistOptions = useTopicStore.persist.getOptions();
  if (!persistOptions.storage || !persistOptions.name) {
    throw errorWithData("Store persist options missing storage or name", persistOptions);
  }

  return persistOptions.storage.getItem(persistOptions.name) as StorageValue<TopicStoreState>;
};

export const setState = (state: TopicStoreState) => {
  useTopicStore.setState(state, false, "setState");
};

export const resetState = () => {
  useTopicStore.setState(initialState, false, "resetState");
};

export const undo = () => {
  useTopicStore.temporal.getState().undo();
};

export const redo = () => {
  useTopicStore.temporal.getState().redo();
};