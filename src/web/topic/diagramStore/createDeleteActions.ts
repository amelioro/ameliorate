import { createDraft, finishDraft } from "immer";

import { RelationName } from "@/common/edge";
import { errorWithData } from "@/common/errorHandling";
import { justificationNodeTypes } from "@/common/node";
import { emitter } from "@/web/common/event";
import { setNewlyAddedNode } from "@/web/common/store/ephemeralStore";
import { WorkspaceContextType } from "@/web/topic/components/TopicWorkspace/WorkspaceContext";
import { getJustificationCount } from "@/web/topic/diagramStore/graphPartHooks";
import { DiagramStoreState, useDiagramStore } from "@/web/topic/diagramStore/store";
import { DirectedToRelation, Relation, canCreateEdge, getRelation } from "@/web/topic/utils/edge";
import {
  Graph,
  type GraphPart,
  Node,
  buildEdge,
  buildNode,
  findGraphPartOrThrow,
  findNodeOrThrow,
  isNode,
} from "@/web/topic/utils/graph";
import { getImplicitLabel } from "@/web/topic/utils/justification";
import { FlowNodeType, edges } from "@/web/topic/utils/node";
import { setSelected } from "@/web/view/selectedPartStore";

const createNode = (
  state: DiagramStoreState,
  toNodeType: FlowNodeType,
  arguedDiagramPartId?: string,
  selectNewNode = true,
) => {
  const newNode = buildNode({ type: toNodeType, arguedDiagramPartId });

  /* eslint-disable functional/immutable-data */
  state.nodes.push(newNode);
  /* eslint-enable functional/immutable-data */

  // TODO?: add node to nodesToShow if we're adding from the diagram so that we never awkwardly add a node and can't see it.

  if (selectNewNode) setSelected(newNode.id);

  return newNode;
};

// if adding a criterion, connect to solutions
// if adding a solution, connect to criteria
const connectCriteriaToSolutions = (state: DiagramStoreState, newNode: Node, problemNode: Node) => {
  const targetRelation: Relation =
    newNode.type === "criterion"
      ? { target: "solution", name: "addresses", source: "problem" }
      : { target: "criterion", name: "criterionFor", source: "problem" };

  const newCriterionEdges = state.edges
    .filter(
      (edge) =>
        edge.source === problemNode.id &&
        edge.label === targetRelation.name &&
        findNodeOrThrow(edge.target, state.nodes).type === targetRelation.target,
    )
    .map((edge) => {
      const sourceId = newNode.type === "criterion" ? newNode.id : edge.target;
      const targetId = newNode.type === "criterion" ? edge.target : newNode.id;

      return buildEdge({
        sourceId,
        targetId,
        relation: "fulfills",
      });
    });

  /* eslint-disable functional/immutable-data, no-param-reassign */
  state.edges.push(...newCriterionEdges);
  /* eslint-enable functional/immutable-data, no-param-reassign */
};

interface AddNodeProps {
  fromPartId: string;
  directedRelation: DirectedToRelation;
  context: WorkspaceContextType;
  selectNewNode?: boolean;
}

export const addNode = ({ fromPartId, directedRelation, context, selectNewNode }: AddNodeProps) => {
  const state = createDraft(useDiagramStore.getState());

  const topicGraph = { nodes: state.nodes, edges: state.edges };
  const toNodeType = directedRelation[directedRelation.as];

  // TODO: replace root claim hackery with direct edge from justification to argued diagram part
  // e.g. instead of support -> supports -> root claim, which requires this creation of a root claim
  // if it doesn't exist, just do support -> supports -> argued diagram part.
  // root claim has existed because edges could not previously point to other edges, but they will
  // be able to soon.
  if (
    directedRelation.source === "rootClaim" &&
    !topicGraph.nodes.find(
      (node) =>
        node.type === "rootClaim" &&
        (node.data.arguedDiagramPartId === fromPartId || node.id === fromPartId),
    )
  ) {
    const label = getImplicitLabel(fromPartId, topicGraph);
    // eslint-disable-next-line functional/immutable-data
    state.nodes.push(buildNode({ type: "rootClaim", arguedDiagramPartId: fromPartId, label }));
  }

  const rootClaim =
    directedRelation.source === "rootClaim"
      ? topicGraph.nodes.find(
          (node) =>
            node.type === "rootClaim" &&
            (node.data.arguedDiagramPartId === fromPartId || node.id === fromPartId),
        )
      : undefined;
  const fromPart =
    rootClaim ?? findGraphPartOrThrow(fromPartId, topicGraph.nodes, topicGraph.edges);

  // create and connect node
  const newNode = createNode(state, toNodeType, fromPart.data.arguedDiagramPartId, selectNewNode);

  const sourceNode = directedRelation.as === "source" ? newNode : fromPart;
  const targetNode = directedRelation.as === "source" ? fromPart : newNode;
  createEdge(topicGraph, targetNode, directedRelation.name, sourceNode);

  // connect criteria
  if (
    ["criterion", "solution"].includes(newNode.type) &&
    fromPart.type === "problem" &&
    directedRelation.as === "target"
  ) {
    connectCriteriaToSolutions(state, newNode, fromPart);
  }

  setNewlyAddedNode(newNode.id, context);

  // trigger event so viewport can be updated.
  // seems like there should be a cleaner way to do this - perhaps custom zustand middleware to emit for any action
  emitter.emit("addNode", newNode);

  // TODO: can we infer the action name from the method name?
  useDiagramStore.setState(finishDraft(state), false, "addNode");
};

export const addNodeWithoutEdge = (
  nodeType: FlowNodeType,
  context: WorkspaceContextType,
  selectNewNode = true,
) => {
  const state = createDraft(useDiagramStore.getState());

  const newNode = createNode(state, nodeType, undefined, selectNewNode);

  setNewlyAddedNode(newNode.id, context);

  // trigger event so viewport can be updated.
  // seems like there should be a cleaner way to do this - perhaps custom zustand middleware to emit for any action
  emitter.emit("addNode", newNode);

  useDiagramStore.setState(finishDraft(state), false, "addNodeWithoutEdge");
};

// see algorithm pseudocode & example at https://github.com/amelioro/ameliorate/issues/66#issuecomment-1465078133
const createEdge = (
  topicGraph: Graph,
  target: GraphPart,
  relationName: RelationName,
  source: GraphPart,
) => {
  // We aren't yet fully supporting edges pointing to other edges.
  // It's not clear at this time whether completely adding or removing support for edges to edges is better,
  // so here's a hack assuming we won't use it for now.,
  if (!isNode(source) || !isNode(target)) throw new Error("source or target is not a node");
  if (!canCreateEdge(topicGraph, target, source)) return null;

  const newEdge = buildEdge({
    sourceId: source.id,
    targetId: target.id,
    relation: relationName,
    arguedDiagramPartId: source.data.arguedDiagramPartId,
  });

  /* eslint-disable functional/immutable-data, no-param-reassign */
  topicGraph.edges.push(newEdge);
  /* eslint-enable functional/immutable-data, no-param-reassign */

  return newEdge;
};

const createConnection = (
  topicGraph: Graph,
  targetId: string | null,
  relationName: RelationName | undefined,
  sourceId: string | null,
) => {
  const source = topicGraph.nodes.find((node) => node.id === sourceId);
  const target = topicGraph.nodes.find((node) => node.id === targetId);
  if (!source || !target) {
    throw errorWithData("source or target not found", sourceId, targetId, topicGraph);
  }

  if (!canCreateEdge(topicGraph, target, source)) return null;

  const relation = getRelation(target.type, relationName, source.type);

  // modifies topicGraph.edges through `state`
  return createEdge(topicGraph, target, relation.name, source);
};

export const connectNodes = (
  targetId: string | null,
  relationName: RelationName | undefined,
  sourceId: string | null,
) => {
  const state = createDraft(useDiagramStore.getState());

  const topicGraph = { nodes: state.nodes, edges: state.edges };
  const newEdge = createConnection(topicGraph, targetId, relationName, sourceId);
  if (!newEdge) return;

  useDiagramStore.setState(finishDraft(state), false, "connectNodes");

  // Not sure if this actually should always be done (e.g. both when dragging to connect nodes, and
  // when using the searchbox to connect nodes), but without much testing, it seems ok to always
  // select the new edge, because the diagram can shift around and make it hard to see what was just
  // added.
  setSelected(newEdge.id);
};

export const reconnectEdge = (
  oldEdge: { id: string; source: string; target: string },
  newSourceId: string | null,
  newTargetId: string | null,
) => {
  if (oldEdge.source === newSourceId && oldEdge.target === newTargetId) return;

  const state = createDraft(useDiagramStore.getState());

  /* eslint-disable functional/immutable-data, no-param-reassign */
  state.edges = state.edges.filter((edge) => edge.id !== oldEdge.id);
  /* eslint-enable functional/immutable-data, no-param-reassign */

  const topicGraph = { nodes: state.nodes, edges: state.edges };
  const newEdge = createConnection(topicGraph, newTargetId, undefined, newSourceId);
  if (!newEdge) return;

  useDiagramStore.setState(finishDraft(state), false, "reconnectEdge");
};

export const deleteNode = (nodeId: string) => {
  const state = createDraft(useDiagramStore.getState());

  const deletedNode = findNodeOrThrow(nodeId, state.nodes);

  const arguedDiagramPartId = deletedNode.data.arguedDiagramPartId;
  if (justificationNodeTypes.includes(deletedNode.type) && arguedDiagramPartId) {
    const remainingArguedJustification = getJustificationCount(state, arguedDiagramPartId);
    // deleted node was the last
    if (remainingArguedJustification <= 1) {
      /* eslint-disable functional/immutable-data, no-param-reassign */
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- consider using a map instead of an object?
      state.nodes = state.nodes.filter(
        (node) => node.data.arguedDiagramPartId !== deletedNode.data.arguedDiagramPartId,
      );
      state.edges = state.edges.filter(
        (edge) => edge.data.arguedDiagramPartId !== deletedNode.data.arguedDiagramPartId,
      );
      /* eslint-enable functional/immutable-data, no-param-reassign */
    }
  }

  const nodeEdges = edges(deletedNode, state.edges);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  // delete this node and edges connected to this node
  state.nodes = state.nodes.filter((node) => node.id !== nodeId);
  state.edges = state.edges.filter((edge) => !nodeEdges.includes(edge));
  deleteInvalidJustification(state);
  /* eslint-enable functional/immutable-data, no-param-reassign */

  // Don't delete or undo/re-create other users' scores because that's awkward to allow permissions-wise.
  // Could delete/undo own scores but if we're already orphaning other users' scores, it seems fine to leave own scores as orphaned too.
  // Long-term should probably have a job to clean up orphaned scores.

  useDiagramStore.setState(finishDraft(state), false, "deleteNode");
};

export const deleteEdge = (edgeId: string) => {
  const state = createDraft(useDiagramStore.getState());

  /* eslint-disable functional/immutable-data, no-param-reassign */
  // delete this edge
  state.edges = state.edges.filter((edge) => edge.id !== edgeId);
  deleteInvalidJustification(state);
  /* eslint-enable functional/immutable-data, no-param-reassign */

  // Don't delete or undo/re-create other users' scores because that's awkward to allow permissions-wise.
  // Could delete/undo own scores but if we're already orphaning other users' scores, it seems fine to leave own scores as orphaned too.
  // Long-term should probably have a job to clean up orphaned scores.

  useDiagramStore.setState(finishDraft(state), false, "deleteEdge");
};

const deleteInvalidJustification = (state: DiagramStoreState) => {
  const graphPartIds = [...state.nodes, ...state.edges].map((graphPart) => graphPart.id);

  /* eslint-disable functional/immutable-data, no-param-reassign */
  state.nodes = state.nodes.filter(
    (node) =>
      node.data.arguedDiagramPartId === undefined ||
      graphPartIds.includes(node.data.arguedDiagramPartId),
  );
  state.edges = state.edges.filter(
    (edge) =>
      edge.data.arguedDiagramPartId === undefined ||
      graphPartIds.includes(edge.data.arguedDiagramPartId),
  );
  /* eslint-enable functional/immutable-data, no-param-reassign */
};

export const deleteGraphPart = (graphPart: GraphPart) => {
  if (isNode(graphPart)) {
    deleteNode(graphPart.id);
  } else {
    deleteEdge(graphPart.id);
  }
};
