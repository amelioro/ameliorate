import { v4 as uuid } from "uuid";

import { getImplicitLabel } from "../utils/claim";
import {
  GraphPartType,
  RelationDirection,
  buildNode,
  findGraphPart,
  findNode,
  layoutVisibleComponents,
} from "../utils/diagram";
import { FlowNodeType, children, parents } from "../utils/node";
import { useTopicStore } from "./store";
import {
  getActiveDiagram,
  getClaimTrees,
  getDiagram,
  getDuplicateState,
  getTopicDiagram,
} from "./utils";

export const viewOrCreateClaimTree = (diagramPartId: string, diagramPartType: GraphPartType) => {
  const state = getDuplicateState();

  // create claim tree if it doesn't exist
  if (!getDiagram(state, diagramPartId)) {
    const activeDiagram = getActiveDiagram(state);
    const diagramPart = findGraphPart(diagramPartId, activeDiagram);
    const label = getImplicitLabel(diagramPartId, diagramPartType, activeDiagram);

    /* eslint-disable functional/immutable-data, no-param-reassign */
    const newNode = buildNode({
      id: uuid(),
      label: label,
      score: diagramPart.data.score,
      type: "rootClaim",
      diagramId: diagramPartId,
    });

    state.diagrams[diagramPartId] = {
      id: diagramPartId,
      nodes: [newNode],
      edges: [],
      type: "claim",
    };
    /* eslint-enable functional/immutable-data, no-param-reassign */
  }

  /* eslint-disable functional/immutable-data, no-param-reassign */
  state.activeClaimTreeId = diagramPartId;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(state, false, "viewOrCreateClaimTree");
};

export const viewClaimTree = (diagramId: string) => {
  useTopicStore.setState({ activeClaimTreeId: diagramId }, false, "viewClaimTree");
};

export const closeClaimTree = () => {
  useTopicStore.setState({ activeClaimTreeId: null }, false, "closeClaimTree");
};

export const closeTable = () => {
  useTopicStore.setState({ activeTableProblemId: null }, false, "closeTable");
};

// potential TODO: could show components that were hidden due to being implied by the now-hidden neighbor
export const toggleShowNeighbors = async (
  nodeId: string,
  neighborType: FlowNodeType,
  direction: RelationDirection,
  show: boolean
) => {
  const state = getDuplicateState();

  const topicDiagram = getTopicDiagram(state); // assuming we're only show/hiding from topic diagram

  const node = findNode(nodeId, topicDiagram);

  const neighborsInDirection =
    direction === "parent" ? parents(node, topicDiagram) : children(node, topicDiagram);

  const neighborsToToggle = neighborsInDirection.filter(
    (neighbor) => neighbor.type === neighborType
  );

  /* eslint-disable functional/immutable-data, no-param-reassign */
  neighborsToToggle.forEach((neighbor) => (neighbor.data.showing = show));
  /* eslint-enable functional/immutable-data, no-param-reassign */

  const layoutedDiagram = await layoutVisibleComponents(topicDiagram, getClaimTrees(state)); // depends on showing having been updated

  /* eslint-disable functional/immutable-data, no-param-reassign */
  topicDiagram.nodes = layoutedDiagram.nodes;
  topicDiagram.edges = layoutedDiagram.edges;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(state, false, "toggleShowNeighbors");
};

export const viewTopicDiagram = () => {
  useTopicStore.setState(
    { activeTableProblemId: null, activeClaimTreeId: null },
    false,
    "viewTopicDiagram"
  );
};

export const viewCriteriaTable = (problemNodeId: string) => {
  useTopicStore.setState(
    { activeTableProblemId: problemNodeId, activeClaimTreeId: null },
    false,
    "viewCriteriaTable"
  );
};

export const toggleShowImpliedEdges = (show: boolean) => {
  useTopicStore.setState({ showImpliedEdges: show }, false, "toggleShowImpliedEdges");
};

export const relayout = async () => {
  const state = getDuplicateState();

  const activeDiagram = getActiveDiagram(state);

  const layoutedDiagram = await layoutVisibleComponents(activeDiagram, getClaimTrees(state));

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.nodes = layoutedDiagram.nodes;
  activeDiagram.edges = layoutedDiagram.edges;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(state, false, "relayout");
};
