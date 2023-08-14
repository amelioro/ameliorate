import { type EdgeSelectionChange, type NodeSelectionChange } from "reactflow";

import { errorWithData } from "../../../common/errorHandling";
import { getRootGraphPart } from "../utils/claim";
import { GraphPartType, Score, findGraphPart, findNode } from "../utils/diagram";
import { useTopicStore } from "./store";
import {
  getActiveDiagram,
  getDiagram,
  getDiagramOrThrow,
  getDuplicateState,
  getTopicDiagram,
} from "./utils";

// score setting is way more work than it needs to be because one score can live in multiple places:
// - on the graphPart
// - on the parent graphPart (if this is a RootClaim)
// - on the child/implicit root claim (if it exists)
// keeping this in sync manually ain't great.
// TODO: store scores in one place
export const setScore = (graphPartId: string, graphPartType: GraphPartType, score: Score) => {
  const state = getDuplicateState();

  // update this node's score
  const activeDiagram = getActiveDiagram(state);
  const graphPart = findGraphPart(graphPartId, graphPartType, activeDiagram);
  /* eslint-disable functional/immutable-data, no-param-reassign */
  graphPart.data.score = score;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  // update parent graphPart's score if this is a RootClaim
  if (graphPart.type === "rootClaim") {
    const topicDiagram = getTopicDiagram(state);
    // assuming we won't support nested root claims, so parent will always be root
    const arguedDiagramPart = getRootGraphPart(activeDiagram.id, topicDiagram);
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

  useTopicStore.setState(state, false, "setScore");
};

export const setNodeLabel = (nodeId: string, value: string) => {
  const state = getDuplicateState();

  const activeDiagram = getActiveDiagram(state);
  const node = findNode(nodeId, activeDiagram);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  node.data.label = value;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(state, false, "setNodeLabel");
};

export const setSelected = (
  selectChanges: NodeSelectionChange[] | EdgeSelectionChange[],
  graphPartType: GraphPartType
) => {
  const state = getDuplicateState();

  const activeDiagram = getActiveDiagram(state);

  selectChanges.forEach((selectChange) => {
    const graphPart = findGraphPart(selectChange.id, graphPartType, activeDiagram);

    /* eslint-disable functional/immutable-data, no-param-reassign */
    graphPart.selected = selectChange.selected;
    /* eslint-enable functional/immutable-data, no-param-reassign */
  });

  useTopicStore.setState(state, false, "setSelected");
};

export const setSelectedGraphPart = (graphPartId: string, graphPartType: GraphPartType) => {
  const state = getDuplicateState();

  const activeDiagram = getActiveDiagram(state);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.nodes = activeDiagram.nodes.map((node) => ({ ...node, selected: false }));
  activeDiagram.edges = activeDiagram.edges.map((edge) => ({ ...edge, selected: false }));
  /* eslint-enable functional/immutable-data, no-param-reassign */

  const graphPart = findGraphPart(graphPartId, graphPartType, activeDiagram);
  /* eslint-disable functional/immutable-data, no-param-reassign */
  graphPart.selected = true;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(state, false, "setSelectedGraphPart");
};
