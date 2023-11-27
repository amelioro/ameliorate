import { createDraft, finishDraft } from "immer";

import { getImplicitLabel } from "../utils/claim";
import { RelationDirection, buildNode, findNode, layoutVisibleComponents } from "../utils/diagram";
import { FlowNodeType, children, parents } from "../utils/node";
import { useTopicStore } from "./store";
import { getActiveDiagram, getClaimEdges, getTopicDiagram } from "./utils";

export const viewOrCreateClaimTree = (arguedDiagramPartId: string) => {
  const state = createDraft(useTopicStore.getState());

  const rootClaim = state.nodes.find(
    (node) => node.type === "rootClaim" && node.data.arguedDiagramPartId === arguedDiagramPartId
  );

  // create claim tree if it doesn't exist
  if (!rootClaim) {
    const topicGraph = { nodes: state.nodes, edges: state.edges };
    const label = getImplicitLabel(arguedDiagramPartId, topicGraph);

    /* eslint-disable functional/immutable-data, no-param-reassign */
    const newNode = buildNode({
      label: label,
      type: "rootClaim",
      arguedDiagramPartId: arguedDiagramPartId,
    });

    state.nodes.push(newNode);
    /* eslint-enable functional/immutable-data, no-param-reassign */
  }

  /* eslint-disable functional/immutable-data, no-param-reassign */
  state.activeClaimTreeId = arguedDiagramPartId;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.temporal.getState().pause();
  useTopicStore.setState(finishDraft(state), false, "viewOrCreateClaimTree");
  useTopicStore.temporal.getState().resume();
};

export const viewClaimTree = (arguedDiagramPartId: string) => {
  useTopicStore.temporal.getState().pause();
  useTopicStore.setState({ activeClaimTreeId: arguedDiagramPartId }, false, "viewClaimTree");
  useTopicStore.temporal.getState().resume();
};

export const closeClaimTree = () => {
  useTopicStore.temporal.getState().pause();
  useTopicStore.setState({ activeClaimTreeId: null }, false, "closeClaimTree");
  useTopicStore.temporal.getState().resume();
};

export const closeTable = () => {
  useTopicStore.temporal.getState().pause();
  useTopicStore.setState({ activeTableProblemId: null }, false, "closeTable");
  useTopicStore.temporal.getState().resume();
};

// potential TODO: could show components that were hidden due to being implied by the now-hidden neighbor
export const toggleShowNeighbors = async (
  nodeId: string,
  neighborType: FlowNodeType,
  direction: RelationDirection,
  show: boolean
) => {
  const state = createDraft(useTopicStore.getState());

  const topicDiagram = getTopicDiagram(state); // assuming we're only show/hiding from topic diagram

  const node = findNode(nodeId, topicDiagram.nodes);

  const neighborsInDirection =
    direction === "parent" ? parents(node, topicDiagram) : children(node, topicDiagram);

  const neighborsToToggle = neighborsInDirection.filter(
    (neighbor) => neighbor.type === neighborType
  );

  /* eslint-disable functional/immutable-data, no-param-reassign */
  neighborsToToggle.forEach((neighbor) => (neighbor.data.showing = show));
  /* eslint-enable functional/immutable-data, no-param-reassign */

  await layoutVisibleComponents(topicDiagram, getClaimEdges(state.edges)); // depends on showing having been updated

  useTopicStore.temporal.getState().pause();
  useTopicStore.setState(finishDraft(state), false, "toggleShowNeighbors");
  useTopicStore.temporal.getState().resume();
};

export const viewTopicDiagram = () => {
  useTopicStore.temporal.getState().pause();
  useTopicStore.setState(
    { activeTableProblemId: null, activeClaimTreeId: null },
    false,
    "viewTopicDiagram"
  );
  useTopicStore.temporal.getState().resume();
};

export const viewCriteriaTable = (problemNodeId: string) => {
  useTopicStore.temporal.getState().pause();
  useTopicStore.setState(
    { activeTableProblemId: problemNodeId, activeClaimTreeId: null },
    false,
    "viewCriteriaTable"
  );
  useTopicStore.temporal.getState().resume();
};

export const toggleShowImpliedEdges = (show: boolean) => {
  useTopicStore.temporal.getState().pause();
  useTopicStore.setState({ showImpliedEdges: show }, false, "toggleShowImpliedEdges");
  useTopicStore.temporal.getState().resume();
};

export const relayout = async () => {
  const state = createDraft(useTopicStore.getState());

  const activeDiagram = getActiveDiagram(state);
  await layoutVisibleComponents(activeDiagram, getClaimEdges(state.edges));

  useTopicStore.setState(finishDraft(state), false, "relayout");
};
