import { createDraft, finishDraft } from "immer";

import { errorWithData } from "@/common/errorHandling";
import { justificationNodeTypes, structureNodeTypes } from "@/common/node";
import { emitter } from "@/web/common/event";
import { getExplicitClaimCount } from "@/web/topic/store/graphPartHooks";
import { TopicStoreState, useTopicStore } from "@/web/topic/store/store";
import { getImplicitLabel } from "@/web/topic/utils/claim";
import { Relation, canCreateEdge, getRelation } from "@/web/topic/utils/edge";
import {
  Graph,
  type GraphPart,
  Node,
  RelationDirection,
  buildEdge,
  buildNode,
  findGraphPartOrThrow,
  findNodeOrThrow,
  getNodesComposedBy,
  isNode,
} from "@/web/topic/utils/graph";
import { FlowNodeType, edges } from "@/web/topic/utils/node";
import { getUnrestrictedEditing } from "@/web/view/actionConfigStore";
import { setSelected } from "@/web/view/currentViewStore/store";

const createNode = (
  state: TopicStoreState,
  toNodeType: FlowNodeType,
  arguedDiagramPartId?: string,
  selectNewNode = true
) => {
  const newNode = buildNode({ type: toNodeType, arguedDiagramPartId });

  /* eslint-disable functional/immutable-data */
  state.nodes.push(newNode);
  newNode.data.newlyAdded = true;
  /* eslint-enable functional/immutable-data */

  // TODO?: add node to nodesToShow if we're adding from the diagram so that we never awkwardly add a node and can't see it.

  if (selectNewNode) setSelected(newNode.id);

  return newNode;
};

// if adding a criterion, connect to solutions
// if adding a solution, connect to criteria
const connectCriteriaToSolutions = (state: TopicStoreState, newNode: Node, problemNode: Node) => {
  const targetRelation: Relation =
    newNode.type === "criterion"
      ? { child: "solution", name: "addresses", parent: "problem" }
      : { child: "criterion", name: "criterionFor", parent: "problem" };

  const newCriterionEdges = state.edges
    .filter(
      (edge) =>
        edge.source === problemNode.id &&
        edge.label === targetRelation.name &&
        findNodeOrThrow(edge.target, state.nodes).type === targetRelation.child
    )
    .map((edge) => {
      const sourceId = newNode.type === "criterion" ? newNode.id : edge.target;
      const targetId = newNode.type === "criterion" ? edge.target : newNode.id;

      return buildEdge({
        sourceId,
        targetId,
        relation: "embodies",
      });
    });

  /* eslint-disable functional/immutable-data, no-param-reassign */
  state.edges.push(...newCriterionEdges);
  /* eslint-enable functional/immutable-data, no-param-reassign */
};

interface AddNodeProps {
  fromPartId: string;
  as: RelationDirection;
  toNodeType: FlowNodeType;
  relation: Relation;
  selectNewNode?: boolean;
}

export const addNode = ({ fromPartId, as, toNodeType, relation, selectNewNode }: AddNodeProps) => {
  if (!getUnrestrictedEditing() && !getRelation(relation.parent, relation.child, relation.name))
    throw errorWithData("invalid relation to add", relation);

  const state = createDraft(useTopicStore.getState());

  const topicGraph = { nodes: state.nodes, edges: state.edges };

  // TODO: replace root claim hackery with direct edge from claims to argued diagram part
  // e.g. instead of support -> supports -> root claim, which requires this creation of a root claim
  // if it doesn't exist, just do support -> supports -> argued diagram part.
  // root claim has existed because edges could not previously point to other edges, but they will
  // be able to soon.
  if (
    relation.parent === "rootClaim" &&
    !topicGraph.nodes.find(
      (node) =>
        node.type === "rootClaim" &&
        (node.data.arguedDiagramPartId === fromPartId || node.id === fromPartId)
    )
  ) {
    const label = getImplicitLabel(fromPartId, topicGraph);
    // eslint-disable-next-line functional/immutable-data
    state.nodes.push(buildNode({ type: "rootClaim", arguedDiagramPartId: fromPartId, label }));
  }

  const rootClaim =
    relation.parent === "rootClaim"
      ? topicGraph.nodes.find(
          (node) =>
            node.type === "rootClaim" &&
            (node.data.arguedDiagramPartId === fromPartId || node.id === fromPartId)
        )
      : undefined;
  const fromPart =
    rootClaim ?? findGraphPartOrThrow(fromPartId, topicGraph.nodes, topicGraph.edges);

  // create and connect node
  const newNode = createNode(state, toNodeType, fromPart.data.arguedDiagramPartId, selectNewNode);

  const parent = as === "parent" ? newNode : fromPart;
  const child = as === "parent" ? fromPart : newNode;
  createEdgeAndImpliedEdges(topicGraph, parent, child, relation);

  // connect criteria
  if (
    ["criterion", "solution"].includes(newNode.type) &&
    fromPart.type === "problem" &&
    as === "child"
  ) {
    connectCriteriaToSolutions(state, newNode, fromPart);
  }

  // trigger event so viewport can be updated.
  // seems like there should be a cleaner way to do this - perhaps custom zustand middleware to emit for any action
  emitter.emit("addNode", newNode);

  // TODO: can we infer the action name from the method name?
  useTopicStore.setState(finishDraft(state), false, "addNode");
};

export const addNodeWithoutParent = (nodeType: FlowNodeType, selectNewNode = true) => {
  const state = createDraft(useTopicStore.getState());

  const newNode = createNode(state, nodeType, undefined, selectNewNode);

  // trigger event so viewport can be updated.
  // seems like there should be a cleaner way to do this - perhaps custom zustand middleware to emit for any action
  emitter.emit("addNode", newNode);

  useTopicStore.setState(finishDraft(state), false, "addNodeWithoutParent");
};

const createEdgesImpliedByComposition = (
  topicGraph: Graph,
  parent: Node,
  child: Node,
  relation: Relation
) => {
  const nodesComposedByParent = getNodesComposedBy(parent, topicGraph);
  nodesComposedByParent
    .filter((composedNode) => composedNode.id != child.id)
    .forEach((composedNode) => {
      const relationForComposed = getRelation(composedNode.type, relation.child, relation.name);
      if (!relationForComposed) return;

      createEdgeAndImpliedEdges(topicGraph, composedNode, child, relationForComposed);
    });

  const nodesComposedByChild = getNodesComposedBy(child, topicGraph);
  nodesComposedByChild
    .filter((composedNode) => composedNode.id != parent.id)
    .forEach((composedNode) => {
      const relationForComposed = getRelation(relation.parent, composedNode.type, relation.name);
      if (!relationForComposed) return;

      createEdgeAndImpliedEdges(topicGraph, parent, composedNode, relationForComposed);
    });
};

// see algorithm pseudocode & example at https://github.com/amelioro/ameliorate/issues/66#issuecomment-1465078133
const createEdgeAndImpliedEdges = (
  topicGraph: Graph,
  parent: GraphPart,
  child: GraphPart,
  relation: Relation
) => {
  // We aren't yet fully supporting edges pointing to other edges.
  // It's not clear at this time whether completely adding or removing support for edges to edges is better,
  // so here's a hack assuming we won't use it for now.,
  if (!isNode(parent) || !isNode(child)) throw new Error("parent or child is not a node");
  if (!canCreateEdge(topicGraph, parent, child)) return topicGraph.edges;

  const newEdge = buildEdge({
    sourceId: parent.id,
    targetId: child.id,
    relation: relation.name,
    arguedDiagramPartId: parent.data.arguedDiagramPartId,
  });

  /* eslint-disable functional/immutable-data, no-param-reassign */
  topicGraph.edges.push(newEdge);
  /* eslint-enable functional/immutable-data, no-param-reassign */

  // don't create implied edges if the node being added is not in the topic diagram
  // e.g. when adding a question to the solution component, don't also link the solution to that
  // question, because it's not as relevant
  if (structureNodeTypes.includes(parent.type) && structureNodeTypes.includes(child.type)) {
    // indirectly recurses by calling this method after determining which implied edges to create
    // note: modifies topicGraph.edges through `state` (via the line above)
    createEdgesImpliedByComposition(topicGraph, parent, child, relation);
  }

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

  const deletedNode = findNodeOrThrow(nodeId, state.nodes);

  const arguedDiagramPartId = deletedNode.data.arguedDiagramPartId;
  if (justificationNodeTypes.includes(deletedNode.type) && arguedDiagramPartId) {
    const remainingArguedClaims = getExplicitClaimCount(state, arguedDiagramPartId);
    // deleted node was the last
    if (remainingArguedClaims <= 1) {
      /* eslint-disable functional/immutable-data, no-param-reassign */
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- consider using a map instead of an object?
      state.nodes = state.nodes.filter(
        (node) => node.data.arguedDiagramPartId !== deletedNode.data.arguedDiagramPartId
      );
      state.edges = state.edges.filter(
        (edge) => edge.data.arguedDiagramPartId !== deletedNode.data.arguedDiagramPartId
      );
      /* eslint-enable functional/immutable-data, no-param-reassign */
    }
  }

  const nodeEdges = edges(deletedNode, state.edges);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  // delete this node and edges connected to this node
  state.nodes = state.nodes.filter((node) => node.id !== nodeId);
  state.edges = state.edges.filter((edge) => !nodeEdges.includes(edge));
  deleteInvalidClaims(state);
  deleteInvalidScores(state);
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "deleteNode");
};

export const deleteEdge = (edgeId: string) => {
  const state = createDraft(useTopicStore.getState());

  /* eslint-disable functional/immutable-data, no-param-reassign */
  // delete this edge
  state.edges = state.edges.filter((edge) => edge.id !== edgeId);
  deleteInvalidClaims(state);
  deleteInvalidScores(state);
  /* eslint-enable functional/immutable-data, no-param-reassign */

  useTopicStore.setState(finishDraft(state), false, "deleteEdge");
};

const deleteInvalidClaims = (state: TopicStoreState) => {
  const graphPartIds = [...state.nodes, ...state.edges].map((graphPart) => graphPart.id);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  state.nodes = state.nodes.filter(
    (node) =>
      node.data.arguedDiagramPartId === undefined ||
      graphPartIds.includes(node.data.arguedDiagramPartId)
  );
  state.edges = state.edges.filter(
    (edge) =>
      edge.data.arguedDiagramPartId === undefined ||
      graphPartIds.includes(edge.data.arguedDiagramPartId)
  );
  /* eslint-enable functional/immutable-data, no-param-reassign */
};

const deleteInvalidScores = (state: TopicStoreState) => {
  const graphPartIds = [...state.nodes, ...state.edges].map((graphPart) => graphPart.id);

  Object.entries(state.userScores).forEach(([_username, scoreByGraphParts]) => {
    Object.entries(scoreByGraphParts).forEach(([graphPartId, _score]) => {
      if (!graphPartIds.includes(graphPartId)) {
        /* eslint-disable functional/immutable-data, no-param-reassign, @typescript-eslint/no-dynamic-delete */
        delete scoreByGraphParts[graphPartId];
        /* eslint-enable functional/immutable-data, no-param-reassign, @typescript-eslint/no-dynamic-delete */
      }
    });
  });
};

export const deleteGraphPart = (graphPart: GraphPart) => {
  if (isNode(graphPart)) {
    deleteNode(graphPart.id);
  } else {
    deleteEdge(graphPart.id);
  }
};
