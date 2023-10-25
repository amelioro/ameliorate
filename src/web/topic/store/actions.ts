import { createDraft, finishDraft } from "immer";
import set from "lodash/set";
import { type EdgeSelectionChange, type NodeSelectionChange } from "reactflow";

import { errorWithData } from "../../../common/errorHandling";
import { Score, findGraphPart, findNode } from "../utils/diagram";
import { useTopicStore } from "./store";
import {
  getActiveDiagram,
  getDiagram,
  getDiagramOrThrow,
  setSelected as setSelectedUtil,
} from "./utils";

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
  const activeDiagram = getActiveDiagram(state);
  const graphPart = findGraphPart(graphPartId, activeDiagram);
  if (graphPart.type === "rootClaim") {
    /* eslint-disable functional/immutable-data, no-param-reassign */
    set(state.userScores, [username, activeDiagram.id], score);
    /* eslint-enable functional/immutable-data, no-param-reassign */
  }

  // update implicit child claim's score if it exists
  if (getDiagram(state, graphPartId)) {
    const claimTree = getDiagramOrThrow(state, graphPartId);
    const rootClaim = claimTree.nodes.find((node) => node.type === "rootClaim");
    if (!rootClaim) throw errorWithData("child claim not found", claimTree);

    /* eslint-disable functional/immutable-data, no-param-reassign */
    set(state.userScores, [username, rootClaim.id], score);
    /* eslint-enable functional/immutable-data, no-param-reassign */
  }

  useTopicStore.setState(finishDraft(state), false, "setScore");
};

export const setNodeLabel = (nodeId: string, value: string) => {
  const state = createDraft(useTopicStore.getState());

  const activeDiagram = getActiveDiagram(state);
  const node = findNode(nodeId, activeDiagram);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  node.data.label = value;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "setNodeLabel");
};

export const setSelected = (selectChanges: NodeSelectionChange[] | EdgeSelectionChange[]) => {
  const state = createDraft(useTopicStore.getState());

  const activeDiagram = getActiveDiagram(state);

  selectChanges.forEach((selectChange) => {
    const graphPart = findGraphPart(selectChange.id, activeDiagram);

    /* eslint-disable functional/immutable-data, no-param-reassign */
    graphPart.selected = selectChange.selected;
    /* eslint-enable functional/immutable-data, no-param-reassign */
  });

  useTopicStore.temporal.getState().pause();
  useTopicStore.setState(finishDraft(state), false, "setSelected");
  useTopicStore.temporal.getState().resume();
};

export const setSelectedGraphPart = (graphPartId: string) => {
  const state = createDraft(useTopicStore.getState());

  const activeDiagram = getActiveDiagram(state);

  setSelectedUtil(graphPartId, activeDiagram);

  useTopicStore.temporal.getState().pause();
  useTopicStore.setState(finishDraft(state), false, "setSelectedGraphPart");
  useTopicStore.temporal.getState().resume();
};
