import { StorageValue } from "zustand/middleware";

import { errorWithData } from "@/common/errorHandling";
import { emitter } from "@/web/common/event";
import {
  DiagramStoreState,
  initialState,
  playgroundUsername,
  useDiagramStore,
} from "@/web/topic/diagramStore/store";
import { getTopic } from "@/web/topic/topicStore/store";
import { isPlaygroundTopic } from "@/web/topic/utils/topic";

export const getPersistState = () => {
  const persistOptions = useDiagramStore.persist.getOptions();
  if (!persistOptions.storage || !persistOptions.name) {
    throw errorWithData("Store persist options missing storage or name", persistOptions);
  }

  return persistOptions.storage.getItem(persistOptions.name) as StorageValue<DiagramStoreState>;
};

export const getScoringUsernames = () => {
  const userScores = useDiagramStore.getState().userScores;
  return Object.keys(userScores);
};

export const setDiagramData = (state: DiagramStoreState, sessionUsername?: string) => {
  const currentTopic = getTopic();

  // Manually specify scores for only the uploading user, since a user shouldn't be able to create
  // scores for other users.
  const sessionScores = sessionUsername ? state.userScores[sessionUsername] : undefined;
  const myScores = sessionScores ?? state.userScores[playgroundUsername]; // state should only have one of these at most
  const myUsername = isPlaygroundTopic(currentTopic) ? playgroundUsername : sessionUsername;

  /**
   * Slightly jank to only overwrite our user's scores so that we don't delete other users' scores,
   * since we shouldn't have permission to.
   * We could consider allowing deleting others' scores on the server (if we're admin?), but then
   * we'd also need permission to create others' scores so that undo/redo could work... which seems
   * not preferred.
   * Note: orphaned scores can cause some confusion, since you can't see them but you'll still see
   * those users' names in the perspectives list. We could consider either filtering the perspectives
   * list to only scores whose diagram parts still exist, or by deleting orphaned scores via job.
   */
  const currentScores = useDiagramStore.getState().userScores;
  const userScores =
    myScores && myUsername ? { ...currentScores, [myUsername]: myScores } : currentScores;

  useDiagramStore.setState({ ...state, userScores }, false, "setDiagramData");

  emitter.emit("overwroteDiagramData");
};

/**
 * Expectation is that you may want to start over with nodes/edges, but
 * topic title and settings aren't changing, and you can go to topic details to change those.
 */
export const resetDiagramData = () => {
  useDiagramStore.setState(initialState, false, "resetDiagramData");

  emitter.emit("overwroteDiagramData");
};

export const undo = () => {
  useDiagramStore.temporal.getState().undo();
};

export const redo = () => {
  useDiagramStore.temporal.getState().redo();
};
