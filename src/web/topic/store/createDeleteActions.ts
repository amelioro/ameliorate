import { createDraft, finishDraft } from "immer";

import { errorWithData } from "../../../common/errorHandling";
import { emitter } from "../../common/event";
import {
  Diagram,
  type GraphPart,
  Node,
  RelationDirection,
  buildEdge,
  buildNode,
  findNode,
  getNodesComposedBy,
  isNode,
  layoutVisibleComponents,
  topicDiagramId,
} from "../utils/diagram";
import { Relation, canCreateEdge, getConnectingEdge, getRelation } from "../utils/edge";
import { FlowNodeType, edges } from "../utils/node";
import { TopicStoreState, useTopicStore } from "./store";
import { getActiveDiagram, getClaimTrees, getTopicDiagram, setSelected } from "./utils";

const createNode = (state: TopicStoreState, toNodeType: FlowNodeType) => {
  const activeDiagram = getActiveDiagram(state);
  const newNode = buildNode({ type: toNodeType, diagramId: activeDiagram.id });

  /* eslint-disable functional/immutable-data */
  activeDiagram.nodes.push(newNode);
  setSelected(newNode.id, activeDiagram);
  newNode.data.newlyAdded = true;
  /* eslint-enable functional/immutable-data */

  return newNode;
};

// if adding a criterion, connect to solutions
// if adding a solution, connect to criteria
const connectCriteriaToSolutions = (state: TopicStoreState, newNode: Node, problemNode: Node) => {
  const topicDiagram = getTopicDiagram(state); // solutions & criteria only will be in the topic diagram

  const targetRelation: Relation =
    newNode.type === "criterion"
      ? { child: "solution", name: "addresses", parent: "problem" }
      : { child: "criterion", name: "criterionFor", parent: "problem" };

  const newCriterionEdges = topicDiagram.edges
    .filter(
      (edge) =>
        edge.source === problemNode.id &&
        edge.label === targetRelation.name &&
        findNode(edge.target, topicDiagram).type === targetRelation.child
    )
    .map((edge) => {
      const sourceNodeId = newNode.type === "criterion" ? newNode.id : edge.target;
      const targetNodeId = newNode.type === "criterion" ? edge.target : newNode.id;

      return buildEdge({
        sourceNodeId,
        targetNodeId,
        relation: "embodies",
        diagramId: topicDiagramId,
      });
    });

  /* eslint-disable functional/immutable-data, no-param-reassign */
  topicDiagram.edges.push(...newCriterionEdges);
  /* eslint-enable functional/immutable-data, no-param-reassign */
};

interface AddNodeProps {
  fromNodeId: string;
  as: RelationDirection;
  toNodeType: FlowNodeType;
  relation: Relation;
}

export const addNode = async ({ fromNodeId, as, toNodeType, relation }: AddNodeProps) => {
  const state = createDraft(useTopicStore.getState());

  const activeDiagram = getActiveDiagram(state);
  const fromNode = findNode(fromNodeId, activeDiagram);

  // create and connect node
  const newNode = createNode(state, toNodeType);

  const parentNode = as === "parent" ? newNode : fromNode;
  const childNode = as === "parent" ? fromNode : newNode;
  createEdgeAndImpliedEdges(activeDiagram, parentNode, childNode, relation);

  // connect criteria
  if (
    ["criterion", "solution"].includes(newNode.type) &&
    fromNode.type === "problem" &&
    as === "child"
  ) {
    connectCriteriaToSolutions(state, newNode, fromNode);
  }

  // re-layout
  const layoutedDiagram = await layoutVisibleComponents(activeDiagram, getClaimTrees(state));

  // trigger event so viewport can be updated.
  // seems like there should be a cleaner way to do this - perhaps custom zustand middleware to emit for any action
  emitter.emit("addNode", findNode(newNode.id, layoutedDiagram));

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.nodes = layoutedDiagram.nodes;
  activeDiagram.edges = layoutedDiagram.edges;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  // TODO: can we infer the action name from the method name?
  useTopicStore.setState(finishDraft(state), false, "addNode");
};

const createEdgesImpliedByComposition = (
  diagram: Diagram,
  parent: Node,
  child: Node,
  relation: Relation
) => {
  const nodesComposedByParent = getNodesComposedBy(parent, diagram);
  nodesComposedByParent.forEach((composedNode) => {
    const relationForComposed = getRelation(composedNode.type, relation.child, relation.name);
    if (!relationForComposed) return;

    createEdgeAndImpliedEdges(diagram, composedNode, child, relationForComposed);
  });

  const nodesComposedByChild = getNodesComposedBy(child, diagram);
  nodesComposedByChild.forEach((composedNode) => {
    const relationForComposed = getRelation(relation.parent, composedNode.type, relation.name);
    if (!relationForComposed) return;

    createEdgeAndImpliedEdges(diagram, parent, composedNode, relationForComposed);
  });
};

// see algorithm pseudocode & example at https://github.com/amelioro/ameliorate/issues/66#issuecomment-1465078133
const createEdgeAndImpliedEdges = (
  diagram: Diagram,
  parent: Node,
  child: Node,
  relation: Relation
) => {
  // assumes only one edge can exist between two notes - future may allow multiple edges of different relation type
  if (getConnectingEdge(parent, child, diagram.edges) !== undefined) return diagram.edges;

  const newEdge = buildEdge({
    sourceNodeId: parent.id,
    targetNodeId: child.id,
    relation: relation.name,
    diagramId: diagram.id,
  });

  /* eslint-disable functional/immutable-data, no-param-reassign */
  diagram.edges = diagram.edges.concat(newEdge);
  /* eslint-enable functional/immutable-data, no-param-reassign */

  // indirectly recurses by calling this method after determining which implied edges to create
  // note: modifies diagram.edges through `state` (via the line above)
  createEdgesImpliedByComposition(diagram, parent, child, relation);

  return diagram.edges;
};

const createConnection = (diagram: Diagram, parentId: string | null, childId: string | null) => {
  const parent = diagram.nodes.find((node) => node.id === parentId);
  const child = diagram.nodes.find((node) => node.id === childId);
  if (!parent || !child) {
    throw errorWithData("parent or child not found", parentId, childId, diagram);
  }

  if (!canCreateEdge(diagram, parent, child)) return false;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- canCreateEdge ensures relation is valid
  const relation = getRelation(parent.type, child.type)!;

  // modifies diagram.edges through `state`
  createEdgeAndImpliedEdges(diagram, parent, child, relation);

  return true;
};

export const connectNodes = async (parentId: string | null, childId: string | null) => {
  const state = createDraft(useTopicStore.getState());

  const activeDiagram = getActiveDiagram(state);

  const created = createConnection(activeDiagram, parentId, childId);
  if (!created) return;

  const layoutedDiagram = await layoutVisibleComponents(activeDiagram, getClaimTrees(state));

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.nodes = layoutedDiagram.nodes;
  activeDiagram.edges = layoutedDiagram.edges;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "connectNodes");
};

export const reconnectEdge = async (
  oldEdge: { id: string; source: string; target: string },
  newParentId: string | null,
  newChildId: string | null
) => {
  if (oldEdge.source === newParentId && oldEdge.target === newChildId) return;

  const state = createDraft(useTopicStore.getState());

  const activeDiagram = getActiveDiagram(state);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.edges = activeDiagram.edges.filter((edge) => edge.id !== oldEdge.id);
  /* eslint-enable functional/immutable-data, no-param-reassign */

  const created = createConnection(activeDiagram, newParentId, newChildId);
  if (!created) return;

  const layoutedDiagram = await layoutVisibleComponents(activeDiagram, getClaimTrees(state));

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.nodes = layoutedDiagram.nodes;
  activeDiagram.edges = layoutedDiagram.edges;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "reconnectEdge");
};

export const deleteNode = async (nodeId: string) => {
  const state = createDraft(useTopicStore.getState());

  const activeDiagram = getActiveDiagram(state);

  if (activeDiagram.type === "problem" && activeDiagram.nodes.length === 1) {
    throw errorWithData("cannot delete last node in problem diagram", activeDiagram);
  }

  const node = findNode(nodeId, activeDiagram);

  if (node.type === "rootClaim") {
    /* eslint-disable functional/immutable-data, no-param-reassign */
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- consider using a map instead of an object?
    delete state.diagrams[activeDiagram.id];
    state.activeClaimTreeId = null;
    /* eslint-enable functional/immutable-data, no-param-reassign */
    return;
  }

  const nodeEdges = edges(node, activeDiagram);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.nodes = activeDiagram.nodes.filter((node) => node.id !== nodeId);
  activeDiagram.edges = activeDiagram.edges.filter((edge) => !nodeEdges.includes(edge));
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- consider using a map instead of an object?
  delete state.diagrams[node.id];
  /* eslint-enable functional/immutable-data, no-param-reassign */

  const layoutedDiagram = await layoutVisibleComponents(activeDiagram, getClaimTrees(state));

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.nodes = layoutedDiagram.nodes;
  activeDiagram.edges = layoutedDiagram.edges;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "deleteNode");
};

export const deleteEdge = async (edgeId: string) => {
  const state = createDraft(useTopicStore.getState());

  const activeDiagram = getActiveDiagram(state);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.edges = activeDiagram.edges.filter((edge) => edge.id !== edgeId);
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- consider using a map instead of an object?
  delete state.diagrams[edgeId];
  /* eslint-enable functional/immutable-data, no-param-reassign */

  const layoutedDiagram = await layoutVisibleComponents(activeDiagram, getClaimTrees(state));

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.nodes = layoutedDiagram.nodes;
  activeDiagram.edges = layoutedDiagram.edges;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "deleteEdge");
};

export const deleteGraphPart = async (graphPart: GraphPart) => {
  if (isNode(graphPart)) {
    await deleteNode(graphPart.id);
  } else {
    await deleteEdge(graphPart.id);
  }
};
