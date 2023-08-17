import { createDraft, finishDraft } from "immer";
import { type EdgeSelectionChange, type NodeSelectionChange } from "reactflow";

import { errorWithData } from "../../../common/errorHandling";
import { GraphPartType, Score, findGraphPart, findNode } from "../utils/diagram";
import { useTopicStore } from "./store";
import {
  getActiveDiagram,
  getDiagram,
  getDiagramOrThrow,
  getTopicDiagram,
  setSelected as setSelectedUtil,
} from "./utils";

// score setting is way more work than it needs to be because one score can live in multiple places:
// - on the graphPart
// - on the parent graphPart (if this is a RootClaim)
// - on the child/implicit root claim (if it exists)
// keeping this in sync manually ain't great.
// TODO: store scores in one place
export const setScore = (graphPartId: string, graphPartType: GraphPartType, score: Score) => {
  const state = createDraft(useTopicStore.getState());

  // update this node's score
  const activeDiagram = getActiveDiagram(state);
  const graphPart = findGraphPart(graphPartId, activeDiagram);
  /* eslint-disable functional/immutable-data, no-param-reassign */
  graphPart.data.score = score;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  // update parent graphPart's score if this is a RootClaim
  if (graphPart.type === "rootClaim") {
    const topicDiagram = getTopicDiagram(state);
    // assuming we won't support nested root claims, so parent will always be root
    const arguedDiagramPart = findGraphPart(activeDiagram.id, topicDiagram);
    /* eslint-disable functional/immutable-data, no-param-reassign */
    arguedDiagramPart.data.score = score;
    /* eslint-enable functional/immutable-data, no-param-reassign */
  }

  // update implicit child claim's score if it exists
  if (getDiagram(state, graphPartId)) {
    const claimTree = getDiagramOrThrow(state, graphPartId);
    const rootClaim = claimTree.nodes.find((node) => node.type === "rootClaim");
    if (!rootClaim) throw errorWithData("child claim not found", claimTree);

    /* eslint-disable functional/immutable-data, no-param-reassign */
    rootClaim.data.score = score;
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

  useTopicStore.setState(finishDraft(state), false, "setSelected");
};

export const setSelectedGraphPart = (graphPartId: string) => {
  const state = createDraft(useTopicStore.getState());

  const activeDiagram = getActiveDiagram(state);

  setSelectedUtil(graphPartId, activeDiagram);

  useTopicStore.setState(finishDraft(state), false, "setSelectedGraphPart");
};
