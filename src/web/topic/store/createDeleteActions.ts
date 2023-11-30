import { createDraft, finishDraft } from "immer";

import { errorWithData } from "../../../common/errorHandling";
import { emitter } from "../../common/event";
import { Relation, canCreateEdge, getConnectingEdge, getRelation } from "../utils/edge";
import {
  Graph,
  type GraphPart,
  Node,
  RelationDirection,
  buildEdge,
  buildNode,
  findNode,
  getNodesComposedBy,
  isNode,
} from "../utils/graph";
import { FlowNodeType, edges } from "../utils/node";
import { TopicStoreState, useTopicStore } from "./store";
import { getActiveDiagram, getTopicDiagram, setSelected } from "./utils";

const createNode = (
  state: TopicStoreState,
  toNodeType: FlowNodeType,
  arguedDiagramPartId?: string
) => {
  const newNode = buildNode({ type: toNodeType, arguedDiagramPartId });

  /* eslint-disable functional/immutable-data */
  state.nodes.push(newNode);
  newNode.data.newlyAdded = true;
  /* eslint-enable functional/immutable-data */

  const activeDiagram = getActiveDiagram(state);
  setSelected(newNode.id, activeDiagram);

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
        findNode(edge.target, topicDiagram.nodes).type === targetRelation.child
    )
    .map((edge) => {
      const sourceNodeId = newNode.type === "criterion" ? newNode.id : edge.target;
      const targetNodeId = newNode.type === "criterion" ? edge.target : newNode.id;

      return buildEdge({
        sourceNodeId,
        targetNodeId,
        relation: "embodies",
      });
    });

  /* eslint-disable functional/immutable-data, no-param-reassign */
  state.edges.push(...newCriterionEdges);
  /* eslint-enable functional/immutable-data, no-param-reassign */
};

interface AddNodeProps {
  fromNodeId: string;
  as: RelationDirection;
  toNodeType: FlowNodeType;
  relation: Relation;
}

export const addNode = ({ fromNodeId, as, toNodeType, relation }: AddNodeProps) => {
  const state = createDraft(useTopicStore.getState());

  const topicGraph = { nodes: state.nodes, edges: state.edges };
  const fromNode = findNode(fromNodeId, topicGraph.nodes);

  // create and connect node
  const newNode = createNode(state, toNodeType, fromNode.data.arguedDiagramPartId);

  const parentNode = as === "parent" ? newNode : fromNode;
  const childNode = as === "parent" ? fromNode : newNode;
  createEdgeAndImpliedEdges(topicGraph, parentNode, childNode, relation);

  // connect criteria
  if (
    ["criterion", "solution"].includes(newNode.type) &&
    fromNode.type === "problem" &&
    as === "child"
  ) {
    connectCriteriaToSolutions(state, newNode, fromNode);
  }

  // trigger event so viewport can be updated.
  // seems like there should be a cleaner way to do this - perhaps custom zustand middleware to emit for any action
  emitter.emit("addNode", newNode);

  // TODO: can we infer the action name from the method name?
  useTopicStore.setState(finishDraft(state), false, "addNode");
};

const createEdgesImpliedByComposition = (
  topicGraph: Graph,
  parent: Node,
  child: Node,
  relation: Relation
) => {
  const nodesComposedByParent = getNodesComposedBy(parent, topicGraph);
  nodesComposedByParent.forEach((composedNode) => {
    const relationForComposed = getRelation(composedNode.type, relation.child, relation.name);
    if (!relationForComposed) return;

    createEdgeAndImpliedEdges(topicGraph, composedNode, child, relationForComposed);
  });

  const nodesComposedByChild = getNodesComposedBy(child, topicGraph);
  nodesComposedByChild.forEach((composedNode) => {
    const relationForComposed = getRelation(relation.parent, composedNode.type, relation.name);
    if (!relationForComposed) return;

    createEdgeAndImpliedEdges(topicGraph, parent, composedNode, relationForComposed);
  });
};

// see algorithm pseudocode & example at https://github.com/amelioro/ameliorate/issues/66#issuecomment-1465078133
const createEdgeAndImpliedEdges = (
  topicGraph: Graph,
  parent: Node,
  child: Node,
  relation: Relation
) => {
  // assumes only one edge can exist between two notes - future may allow multiple edges of different relation type
  if (getConnectingEdge(parent, child, topicGraph.edges) !== undefined) return topicGraph.edges;

  const newEdge = buildEdge({
    sourceNodeId: parent.id,
    targetNodeId: child.id,
    relation: relation.name,
    arguedDiagramPartId: parent.data.arguedDiagramPartId,
  });

  /* eslint-disable functional/immutable-data, no-param-reassign */
  topicGraph.edges.push(newEdge);
  /* eslint-enable functional/immutable-data, no-param-reassign */

  // indirectly recurses by calling this method after determining which implied edges to create
  // note: modifies topicGraph.edges through `state` (via the line above)
  createEdgesImpliedByComposition(topicGraph, parent, child, relation);

  return topicGraph.edges;
};

const createConnection = (topicGraph: Graph, parentId: string | null, childId: string | null) => {
  const parent = topicGraph.nodes.find((node) => node.id === parentId);
  const child = topicGraph.nodes.find((node) => node.id === childId);
  if (!parent || !child) {
    throw errorWithData("parent or child not found", parentId, childId, topicGraph);
  }

  if (!canCreateEdge(topicGraph, parent, child)) return false;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- canCreateEdge ensures relation is valid
  const relation = getRelation(parent.type, child.type)!;

  // modifies topicGraph.edges through `state`
  createEdgeAndImpliedEdges(topicGraph, parent, child, relation);

  return true;
};

export const connectNodes = (parentId: string | null, childId: string | null) => {
  const state = createDraft(useTopicStore.getState());

  const topicGraph = { nodes: state.nodes, edges: state.edges };
  const created = createConnection(topicGraph, parentId, childId);
  if (!created) return;

  useTopicStore.setState(finishDraft(state), false, "connectNodes");
};

export const reconnectEdge = (
  oldEdge: { id: string; source: string; target: string },
  newParentId: string | null,
  newChildId: string | null
) => {
  if (oldEdge.source === newParentId && oldEdge.target === newChildId) return;

  const state = createDraft(useTopicStore.getState());

  /* eslint-disable functional/immutable-data, no-param-reassign */
  state.edges = state.edges.filter((edge) => edge.id !== oldEdge.id);
  /* eslint-enable functional/immutable-data, no-param-reassign */

  const topicGraph = { nodes: state.nodes, edges: state.edges };
  const created = createConnection(topicGraph, newParentId, newChildId);
  if (!created) return;

  useTopicStore.setState(finishDraft(state), false, "reconnectEdge");
};

export const deleteNode = (nodeId: string) => {
  const state = createDraft(useTopicStore.getState());

  const deletedNode = findNode(nodeId, state.nodes);
  if (deletedNode.type === "rootClaim") {
    /* eslint-disable functional/immutable-data, no-param-reassign */
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- consider using a map instead of an object?
    state.nodes = state.nodes.filter(
      (node) => node.data.arguedDiagramPartId !== deletedNode.data.arguedDiagramPartId
    );
    state.edges = state.edges.filter(
      (edge) => edge.data.arguedDiagramPartId !== deletedNode.data.arguedDiagramPartId
    );
    state.activeClaimTreeId = null;
    /* eslint-enable functional/immutable-data, no-param-reassign */
    return;
  }

  const nodeEdges = edges(deletedNode, state.edges);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  // delete this node, edges connected to this node, and node's claim tree
  state.nodes = state.nodes.filter(
    (node) => node.id !== nodeId && node.data.arguedDiagramPartId !== nodeId
  );
  state.edges = state.edges.filter(
    (edge) => !nodeEdges.includes(edge) && edge.data.arguedDiagramPartId !== nodeId
  );
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "deleteNode");
};

export const deleteEdge = (edgeId: string) => {
  const state = createDraft(useTopicStore.getState());

  /* eslint-disable functional/immutable-data, no-param-reassign */
  // delete this edge and edge's claim tree
  state.nodes = state.nodes.filter((node) => node.data.arguedDiagramPartId !== edgeId);
  state.edges = state.edges.filter(
    (edge) => edge.id !== edgeId && edge.data.arguedDiagramPartId !== edgeId
  );
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "deleteEdge");
};

export const deleteGraphPart = (graphPart: GraphPart) => {
  if (isNode(graphPart)) {
    deleteNode(graphPart.id);
  } else {
    deleteEdge(graphPart.id);
  }
};
