import { createDraft, finishDraft } from "immer";

import { RelationDirection } from "../utils/graph";
import { FlowNodeType, children, parents } from "../utils/node";
import { useTopicStore } from "./store";

// potential TODO: could show components that were hidden due to being implied by the now-hidden neighbor
export const toggleShowNeighbors = (
  nodeId: string,
  neighborType: FlowNodeType,
  direction: RelationDirection,
  show: boolean
) => {
  const state = createDraft(useTopicStore.getState());

  const topicGraph = { nodes: state.nodes, edges: state.edges };

  const neighborsInDirection =
    direction === "parent" ? parents(nodeId, topicGraph) : children(nodeId, topicGraph);

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
