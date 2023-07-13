import { errorWithData } from "../../common/errorHandling";
import { emitter } from "../../common/event";
import { getClaimDiagramId } from "../utils/claim";
import {
  type Node,
  RelationDirection,
  buildEdge,
  buildNode,
  findNode,
  getNodesComposedBy,
  layoutVisibleComponents,
  problemDiagramId,
} from "../utils/diagram";
import { Relation, canCreateEdge, getConnectingEdge, getRelation } from "../utils/edge";
import { NodeType, edges } from "../utils/node";
import { TopicStoreState, useTopicStore } from "./store";
import {
  getActiveDiagram,
  getClaimDiagrams,
  getDiagramOrThrow,
  getDuplicateState,
  getProblemDiagram,
} from "./utils";

const createNode = (state: TopicStoreState, toNodeType: NodeType) => {
  /* eslint-disable functional/immutable-data, no-param-reassign */
  const newNodeId = `${state.nextNodeId++}`;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  const activeDiagram = getActiveDiagram(state);
  const newNode = buildNode({ id: newNodeId, type: toNodeType, diagramId: activeDiagram.id });

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.nodes = [
    ...activeDiagram.nodes.map((node) => ({ ...node, selected: false })),
    { ...newNode, selected: true },
  ];
  /* eslint-enable functional/immutable-data, no-param-reassign */

  return newNode;
};

// if adding a criterion, connect to solutions
// if adding a solution, connect to criteria
const connectCriteriaToSolutions = (state: TopicStoreState, newNode: Node, problemNode: Node) => {
  const problemDiagram = getProblemDiagram(state); // solutions & criteria only will be in the problem diagram

  const targetRelation: Relation =
    newNode.type === "criterion"
      ? { child: "solution", name: "addresses", parent: "problem" }
      : { child: "criterion", name: "criterion for", parent: "problem" };

  const newCriterionEdges = problemDiagram.edges
    .filter(
      (edge) =>
        edge.source === problemNode.id &&
        edge.label === targetRelation.name &&
        findNode(edge.target, problemDiagram).type === targetRelation.child
    )
    .map((edge) => {
      /* eslint-disable functional/immutable-data, no-param-reassign */
      const newCriterionEdgeId = `${state.nextEdgeId++}`;
      /* eslint-enable functional/immutable-data, no-param-reassign */

      const sourceNodeId = newNode.type === "criterion" ? newNode.id : edge.target;
      const targetNodeId = newNode.type === "criterion" ? edge.target : newNode.id;

      return buildEdge(
        newCriterionEdgeId,
        sourceNodeId,
        targetNodeId,
        "embodies",
        problemDiagramId
      );
    });

  /* eslint-disable functional/immutable-data, no-param-reassign */
  problemDiagram.edges.push(...newCriterionEdges);
  /* eslint-enable functional/immutable-data, no-param-reassign */
};

interface AddNodeProps {
  fromNodeId: string;
  as: RelationDirection;
  toNodeType: NodeType;
  relation: Relation;
}

export const addNode = async ({ fromNodeId, as, toNodeType, relation }: AddNodeProps) => {
  const state = getDuplicateState();

  const activeDiagram = getActiveDiagram(state);
  const fromNode = findNode(fromNodeId, activeDiagram);

  // create and connect node
  const newNode = createNode(state, toNodeType);

  const parentNode = as === "parent" ? newNode : fromNode;
  const childNode = as === "parent" ? fromNode : newNode;
  createEdgeAndImpliedEdges(state, parentNode, childNode, relation);

  // connect criteria
  if (
    ["criterion", "solution"].includes(newNode.type) &&
    fromNode.type === "problem" &&
    as === "child"
  ) {
    connectCriteriaToSolutions(state, newNode, fromNode);
  }

  // re-layout
  const layoutedDiagram = await layoutVisibleComponents(activeDiagram, getClaimDiagrams(state));

  // trigger event so viewport can be updated.
  // seems like there should be a cleaner way to do this - perhaps custom zustand middleware to emit for any action
  emitter.emit("addNode", findNode(newNode.id, layoutedDiagram));

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.nodes = layoutedDiagram.nodes;
  activeDiagram.edges = layoutedDiagram.edges;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  // TODO: can we infer the action name from the method name?
  useTopicStore.setState(state, false, "addNode");
};

const createEdgesImpliedByComposition = (
  state: TopicStoreState,
  parent: Node,
  child: Node,
  relation: Relation
) => {
  const diagram = getDiagramOrThrow(state, parent.data.diagramId);

  const nodesComposedByParent = getNodesComposedBy(parent, diagram);
  nodesComposedByParent.forEach((composedNode) => {
    const relationForComposed = getRelation(composedNode.type, relation.child, relation.name);
    if (!relationForComposed) return;

    createEdgeAndImpliedEdges(state, composedNode, child, relationForComposed);
  });

  const nodesComposedByChild = getNodesComposedBy(child, diagram);
  nodesComposedByChild.forEach((composedNode) => {
    const relationForComposed = getRelation(relation.parent, composedNode.type, relation.name);
    if (!relationForComposed) return;

    createEdgeAndImpliedEdges(state, parent, composedNode, relationForComposed);
  });
};

// see algorithm pseudocode & example at https://github.com/amelioro/ameliorate/issues/66#issuecomment-1465078133
const createEdgeAndImpliedEdges = (
  state: TopicStoreState,
  parent: Node,
  child: Node,
  relation: Relation
) => {
  const diagram = getDiagramOrThrow(state, parent.data.diagramId);

  // assumes only one edge can exist between two notes - future may allow multiple edges of different relation type
  if (getConnectingEdge(parent, child, diagram.edges) !== undefined) return diagram.edges;

  /* eslint-disable functional/immutable-data, no-param-reassign */
  const newEdgeId = `${state.nextEdgeId++}`;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  const newEdge = buildEdge(newEdgeId, parent.id, child.id, relation.name, diagram.id);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  diagram.edges = diagram.edges.concat(newEdge);
  /* eslint-enable functional/immutable-data, no-param-reassign */

  // indirectly recurses by calling this method after determining which implied edges to create
  // note: modifies diagram.edges through `state` (via the line above)
  createEdgesImpliedByComposition(state, parent, child, relation);

  return diagram.edges;
};

export const connectNodes = async (parentId: string | null, childId: string | null) => {
  const state = getDuplicateState();

  const activeDiagram = getActiveDiagram(state);

  const parent = activeDiagram.nodes.find((node) => node.id === parentId);
  const child = activeDiagram.nodes.find((node) => node.id === childId);
  if (!parent || !child) {
    throw errorWithData("parent or child not found", parentId, childId, activeDiagram);
  }

  if (!canCreateEdge(activeDiagram, parent, child)) return;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- canCreateEdge ensures relation is valid
  const relation = getRelation(parent.type, child.type)!;

  // modifies diagram.edges through `state`
  createEdgeAndImpliedEdges(state, parent, child, relation);

  const layoutedDiagram = await layoutVisibleComponents(activeDiagram, getClaimDiagrams(state));

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.nodes = layoutedDiagram.nodes;
  activeDiagram.edges = layoutedDiagram.edges;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(state, false, "connectNodes");
};

export const deleteNode = async (nodeId: string) => {
  const state = getDuplicateState();

  const activeDiagram = getActiveDiagram(state);

  const node = findNode(nodeId, activeDiagram);

  if (node.type === "rootClaim") {
    /* eslint-disable functional/immutable-data, no-param-reassign */
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- consider using a map instead of an object?
    delete state.diagrams[activeDiagram.id];
    state.activeClaimDiagramId = null;
    /* eslint-enable functional/immutable-data, no-param-reassign */
    return;
  }

  const nodeEdges = edges(node, activeDiagram);
  const childDiagramId = getClaimDiagramId(node.id, "node");

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.nodes = activeDiagram.nodes.filter((node) => node.id !== nodeId);
  activeDiagram.edges = activeDiagram.edges.filter((edge) => !nodeEdges.includes(edge));
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- consider using a map instead of an object?
  delete state.diagrams[childDiagramId];
  /* eslint-enable functional/immutable-data, no-param-reassign */

  const layoutedDiagram = await layoutVisibleComponents(activeDiagram, getClaimDiagrams(state));

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.nodes = layoutedDiagram.nodes;
  activeDiagram.edges = layoutedDiagram.edges;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(state, false, "deleteNode");
};

export const deleteEdge = async (edgeId: string) => {
  const state = getDuplicateState();

  const activeDiagram = getActiveDiagram(state);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.edges = activeDiagram.edges.filter((edge) => edge.id !== edgeId);
  /* eslint-enable functional/immutable-data, no-param-reassign */

  const layoutedDiagram = await layoutVisibleComponents(activeDiagram, getClaimDiagrams(state));

  /* eslint-disable functional/immutable-data, no-param-reassign */
  activeDiagram.nodes = layoutedDiagram.nodes;
  activeDiagram.edges = layoutedDiagram.edges;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(state, false, "deleteEdge");
};
