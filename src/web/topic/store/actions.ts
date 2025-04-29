import { createDraft, finishDraft } from "immer";
import set from "lodash/set";

import { RelationName, edgeSchema } from "@/common/edge";
import { errorWithData } from "@/common/errorHandling";
import { NodeType, nodeSchema } from "@/common/node";
import { useTopicStore } from "@/web/topic/store/store";
import {
  Edge,
  GraphPart,
  type Node,
  Score,
  findEdgeOrThrow,
  findGraphPartOrThrow,
  findNodeOrThrow,
} from "@/web/topic/utils/graph";

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
  const graphPart = findGraphPartOrThrow(graphPartId, state.nodes, state.edges);
  if (graphPart.type === "rootClaim") {
    if (graphPart.data.arguedDiagramPartId === undefined)
      throw errorWithData("no arguedDiagramPartId on root claim", graphPart);

    /* eslint-disable functional/immutable-data, no-param-reassign */
    set(state.userScores, [username, graphPart.data.arguedDiagramPartId], score);
    /* eslint-enable functional/immutable-data, no-param-reassign */
  }

  // update implicit child claim's score if it exists
  const implicitRootClaim = state.nodes.find(
    (node) => node.data.arguedDiagramPartId === graphPartId,
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

  const foundNode = findNodeOrThrow(node.id, state.nodes);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  foundNode.data.label = value;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "setNodeLabel");
};

export const setCustomNodeType = (node: Node, value: string) => {
  const state = createDraft(useTopicStore.getState());

  const parsed = nodeSchema.shape.customType.safeParse(value);
  if (!parsed.success) throw parsed.error;

  const foundNode = findNodeOrThrow(node.id, state.nodes);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  foundNode.data.customType = value;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "setCustomEdgeLabel");
};

export const setCustomEdgeLabel = (edge: Edge, value: string) => {
  const state = createDraft(useTopicStore.getState());

  const parsed = edgeSchema.shape.customLabel.safeParse(value);
  if (!parsed.success) throw parsed.error;

  const foundEdge = findEdgeOrThrow(edge.id, state.edges);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  foundEdge.data.customLabel = value;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "setCustomEdgeLabel");
};

export const changeNodeType = (node: Node, newType: NodeType) => {
  const state = createDraft(useTopicStore.getState());

  const foundNode = findNodeOrThrow(node.id, state.nodes);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  foundNode.type = newType;
  foundNode.data.customType = null; // reset custom type so new type is used for label
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "changeNodeType");
};

export const changeEdgeType = (edge: Edge, newType: RelationName) => {
  const state = createDraft(useTopicStore.getState());

  const foundEdge = findEdgeOrThrow(edge.id, state.edges);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  foundEdge.label = newType;
  foundEdge.data.customLabel = null; // reset custom label so new type is used for label
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "changeEdgeType");
};

export const setGraphPartNotes = (graphPart: GraphPart, value: string) => {
  const state = createDraft(useTopicStore.getState());

  const foundGraphPart = findGraphPartOrThrow(graphPart.id, state.nodes, state.edges);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  foundGraphPart.data.notes = value;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "setGraphPartNotes");
};
