import { createDraft, finishDraft } from "immer";
import set from "lodash/set";

import { errorWithData } from "../../../common/errorHandling";
import { GraphPart, type Node, Score, findGraphPart, findNode } from "../utils/graph";
import { useTopicStore } from "./store";

// score setting is way more work than it needs to be because one score can live in multiple places:
// - on the graphPart
// - on the parent graphPart (if this is a RootClaim)
// - on the child/implicit root claim (if it exists)
// keeping this in sync manually ain't great.
// TODO: store scores in one place
export const setScore = (username: string, graphPartId: string, score: Score) => {
  const state = createDraft(useTopicStore.getState());

  /* eslint-disable functional/immutable-data, no-param-reassign */
  set(state.userScores, [username, graphPartId], score);
  /* eslint-enable functional/immutable-data, no-param-reassign */

  // update parent graphPart's score if this is a RootClaim
  const graphPart = findGraphPart(graphPartId, state.nodes, state.edges);
  if (graphPart.type === "rootClaim") {
    if (graphPart.data.arguedDiagramPartId === undefined)
      throw errorWithData("no arguedDiagramPartId on root claim", graphPart);

    /* eslint-disable functional/immutable-data, no-param-reassign */
    set(state.userScores, [username, graphPart.data.arguedDiagramPartId], score);
    /* eslint-enable functional/immutable-data, no-param-reassign */
  }

  // update implicit child claim's score if it exists
  const implicitRootClaim = state.nodes.find(
    (node) => node.data.arguedDiagramPartId === graphPartId
  );
  if (implicitRootClaim) {
    /* eslint-disable functional/immutable-data, no-param-reassign */
    set(state.userScores, [username, implicitRootClaim.id], score);
    /* eslint-enable functional/immutable-data, no-param-reassign */
  }

  useTopicStore.setState(finishDraft(state), false, "setScore");
};

export const setNodeLabel = (node: Node, value: string) => {
  const state = createDraft(useTopicStore.getState());

  const foundNode = findNode(node.id, state.nodes);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  foundNode.data.label = value;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "setNodeLabel");
};

export const setGraphPartNotes = (graphPart: GraphPart, value: string) => {
  const state = createDraft(useTopicStore.getState());

  const foundGraphPart = findGraphPart(graphPart.id, state.nodes, state.edges);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  foundGraphPart.data.notes = value;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "setGraphPartNotes");
};

export const finishAddingNode = (nodeId: string) => {
  const state = createDraft(useTopicStore.getState());

  const node = findNode(nodeId, state.nodes);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  node.data.newlyAdded = false;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.temporal.getState().pause();
  useTopicStore.setState(finishDraft(state), false, "finishAddingNode");
  useTopicStore.temporal.getState().resume();
};
