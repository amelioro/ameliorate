import { createDraft, finishDraft } from "immer";

import { RelationDirection, findNode } from "../utils/graph";
import { FlowNodeType, children, parents } from "../utils/node";
import { useTopicStore } from "./store";

// TODO: create root claim when support/critique is added, prevent viewing claim tree if root claim doesn't exist, claim details section should be good enough
// also?: could delete root claim if deleted node is the last child of the root claim
// ... conveniently, this removes awkwardness with claim tree of no-root-claim being viewable only if user has edit access

// TODO: remove when root claim is removed
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const viewOrCreateClaimTree = (arguedDiagramPartId: string) => {
  // TODO: filter to selected root claim
  // const state = createDraft(useTopicStore.getState());
  // const rootClaim = state.nodes.find(
  //   (node) => node.type === "rootClaim" && node.data.arguedDiagramPartId === arguedDiagramPartId
  // );
  // // create claim tree if it doesn't exist
  // if (!rootClaim) {
  //   const topicGraph = { nodes: state.nodes, edges: state.edges };
  //   const label = getImplicitLabel(arguedDiagramPartId, topicGraph);
  //   /* eslint-disable functional/immutable-data, no-param-reassign */
  //   const newNode = buildNode({
  //     label: label,
  //     type: "rootClaim",
  //     arguedDiagramPartId: arguedDiagramPartId,
  //   });
  //   state.nodes.push(newNode);
  //   /* eslint-enable functional/immutable-data, no-param-reassign */
  // }
  // useTopicStore.temporal.getState().pause();
  // useTopicStore.setState(finishDraft(state), false, "viewOrCreateClaimTree");
  // useTopicStore.temporal.getState().resume();
  // viewClaimTree(arguedDiagramPartId);
};

// potential TODO: could show components that were hidden due to being implied by the now-hidden neighbor
export const toggleShowNeighbors = (
  nodeId: string,
  neighborType: FlowNodeType,
  direction: RelationDirection,
  show: boolean
) => {
  const state = createDraft(useTopicStore.getState());

  const topicGraph = { nodes: state.nodes, edges: state.edges };

  const node = findNode(nodeId, topicGraph.nodes);

  const neighborsInDirection =
    direction === "parent" ? parents(node, topicGraph) : children(node, topicGraph);

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
