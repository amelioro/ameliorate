import { createDraft, finishDraft } from "immer";

import { viewClaimTree } from "../../view/navigateStore";
import { getImplicitLabel } from "../utils/claim";
import { RelationDirection, buildNode, findNode } from "../utils/graph";
import { FlowNodeType, children, parents } from "../utils/node";
import { useTopicStore } from "./store";
import { getTopicDiagram } from "./utils";

// TODO: remove when root claim is removed
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

  useTopicStore.temporal.getState().pause();
  useTopicStore.setState(finishDraft(state), false, "viewOrCreateClaimTree");
  useTopicStore.temporal.getState().resume();

  viewClaimTree(arguedDiagramPartId);
};

// potential TODO: could show components that were hidden due to being implied by the now-hidden neighbor
export const toggleShowNeighbors = (
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

  useTopicStore.temporal.getState().pause();
  useTopicStore.setState(finishDraft(state), false, "toggleShowNeighbors");
  useTopicStore.temporal.getState().resume();
};
