import { TopicStoreState, initialState, useTopicStore } from "./store";

export const getState = () => {
  return useTopicStore.getState();
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
