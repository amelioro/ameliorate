import { v4 as uuid } from "uuid";
import { StorageValue } from "zustand/middleware";

import { errorWithData } from "../../../common/errorHandling";
import { emitter } from "../../common/event";
import { Edge, Node } from "../utils/graph";
import {
  TopicStoreState,
  UserScores,
  initialState,
  playgroundUsername,
  useTopicStore,
} from "./store";
import { isPlaygroundTopic } from "./utils";

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

/**
 * Generate new ids for nodes and edges to avoid conflicts with the topic that this was downloaded
 * from.
 *
 * Also, ensure that related scores, claims, and edges are updated accordingly.
 */
const ensureUnique = (nodes: Node[], edges: Edge[], userScores: UserScores) => {
  [...nodes, ...edges].forEach((graphPart) => {
    const newId = uuid();

    // update edges
    edges.forEach((edge) => {
      // eslint-disable-next-line functional/immutable-data, no-param-reassign
      if (edge.source === graphPart.id) edge.source = newId;
      // eslint-disable-next-line functional/immutable-data, no-param-reassign
      if (edge.target === graphPart.id) edge.target = newId;
    });

    // update claims
    [...nodes, ...edges].forEach((otherGraphPart) => {
      if (otherGraphPart.data.arguedDiagramPartId === graphPart.id) {
        // eslint-disable-next-line functional/immutable-data, no-param-reassign
        otherGraphPart.data.arguedDiagramPartId = newId;
      }
    });

    // update scores
    Object.entries(userScores).forEach(([_username, partScores]) => {
      const partScore = partScores[graphPart.id];
      if (partScore) {
        // eslint-disable-next-line functional/immutable-data, no-param-reassign
        partScores[newId] = partScore;
        // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-dynamic-delete, no-param-reassign
        delete partScores[graphPart.id];
      }
    });

    // update graph part
    // eslint-disable-next-line functional/immutable-data, no-param-reassign
    graphPart.id = newId;
  });
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

  ensureUnique(state.nodes, state.edges, userScores);

  useTopicStore.setState({ ...state, topic, userScores }, false, "setState");

  emitter.emit("overwroteTopicData");
};

/**
 * Maintain topic details; expectation is that you may want to start over with nodes/edges, but
 * topic title and settings aren't changing, and you can go to topic details to change those.
 */
export const resetTopicData = () => {
  // TODO?: allow topic description to be reset, since it's editable from the playground
  const topic = useTopicStore.getState().topic;
  useTopicStore.setState({ ...initialState, topic }, false, "resetState");

  emitter.emit("overwroteTopicData");
};

export const undo = () => {
  useTopicStore.temporal.getState().undo();
};

export const redo = () => {
  useTopicStore.temporal.getState().redo();
};
