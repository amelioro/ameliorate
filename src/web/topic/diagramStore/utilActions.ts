import { StorageValue } from "zustand/middleware";

import { errorWithData } from "@/common/errorHandling";
import { emitter } from "@/web/common/event";
import {
  TopicStoreState,
  initialState,
  playgroundUsername,
  useTopicStore,
} from "@/web/topic/diagramStore/store";
import { isPlaygroundTopic } from "@/web/topic/diagramStore/utils";

export const getPersistState = () => {
  const persistOptions = useTopicStore.persist.getOptions();
  if (!persistOptions.storage || !persistOptions.name) {
    throw errorWithData("Store persist options missing storage or name", persistOptions);
  }

  return persistOptions.storage.getItem(persistOptions.name) as StorageValue<TopicStoreState>;
};

export const getScoringUsernames = () => {
  const userScores = useTopicStore.getState().userScores;
  return Object.keys(userScores);
};

export const isOnPlayground = () => {
  return isPlaygroundTopic(useTopicStore.getState().topic);
};

export const setTopicData = (state: TopicStoreState, sessionUsername?: string) => {
  // Don't override topic - this way, topic data from playground can be downloaded and uploaded as
  // a means of saving playground data to the db.
  // This also allows starting a new, separate topic from an existing topic's data.
  // TODO?: allow topic description to be overridden, since it's editable from the playground
  const topic = useTopicStore.getState().topic;

  // Manually specify scores for only the uploading user, since a user shouldn't be able to create
  // scores for other users.
  const sessionScores = sessionUsername ? state.userScores[sessionUsername] : undefined;
  const myScores = sessionScores ?? state.userScores[playgroundUsername]; // state should only have one of these at most
  const myUsername = isPlaygroundTopic(topic) ? playgroundUsername : sessionUsername;
  const userScores = myScores && myUsername ? { [myUsername]: myScores } : {};

  useTopicStore.setState({ ...state, topic, userScores }, false, "setTopicData");

  emitter.emit("overwroteTopicData");
};

/**
 * Maintain topic details; expectation is that you may want to start over with nodes/edges, but
 * topic title and settings aren't changing, and you can go to topic details to change those.
 */
export const resetTopicData = () => {
  // TODO?: allow topic description to be reset, since it's editable from the playground
  const topic = useTopicStore.getState().topic;
  useTopicStore.setState({ ...initialState, topic }, false, "resetTopicData");

  emitter.emit("overwroteTopicData");
};

export const undo = () => {
  useTopicStore.temporal.getState().undo();
};

export const redo = () => {
  useTopicStore.temporal.getState().redo();
};
