import { emitter } from "../../../common/event";
import { getClaimDiagramId, getImplicitLabel, parseClaimDiagramId } from "../utils/claim";
import {
  ArguableType,
  Edge,
  Node,
  ProblemNode,
  RelationDirection,
  Score,
  buildEdge,
  buildNode,
  findArguable,
  findNode,
  layoutVisibleComponents,
} from "../utils/diagram";
import { RelationName, canCreateEdge, getRelation } from "../utils/edge";
import { NodeType, edges } from "../utils/nodes";
import { TopicStoreState, initialState, problemDiagramId, useTopicStore } from "./store";

export const getState = () => {
  return useTopicStore.getState();
};

export const setState = (state: TopicStoreState) => {
  useTopicStore.setState(() => state);
};

export const resetState = () => {
  useTopicStore.setState(initialState, false, "resetState");
};

export const undo = () => {
  useTopicStore.temporal.getState().undo();
};

export const redo = () => {
  useTopicStore.temporal.getState().redo();
};

const getActiveDiagram = (state: TopicStoreState) => {
  const activeDiagramId = state.activeClaimDiagramId ?? problemDiagramId;
  return state.diagrams[activeDiagramId];
};

interface AddNodeProps {
  fromNodeId: string;
  as: RelationDirection;
  toNodeType: NodeType;
  relation: RelationName;
}

const createAndConnectNode = (
  state: TopicStoreState,
  { fromNodeId, as, toNodeType, relation }: AddNodeProps
) => {
  /* eslint-disable functional/immutable-data, no-param-reassign */
  const newNodeId = `${state.nextNodeId++}`;
  const newEdgeId = `${state.nextEdgeId++}`;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  const activeDiagram = getActiveDiagram(state);
  const newNode = buildNode({ id: newNodeId, type: toNodeType, diagramId: activeDiagram.id });

  const sourceNodeId = as === "parent" ? newNodeId : fromNodeId;
  const targetNodeId = as === "parent" ? fromNodeId : newNodeId;
  const newEdge = buildEdge(newEdgeId, sourceNodeId, targetNodeId, relation, activeDiagram.id);

  return [newNode, newEdge] as [Node, Edge];
};

// if adding a criterion, connect to solutions
// if adding a solution, connect to criteria
const connectCriteriaToSolutions = (state: TopicStoreState, newNode: Node, fromNode: Node) => {
  const problemDiagram = state.diagrams[problemDiagramId]; // solutions & criteria only will be in the problem diagram

  const targetRelation: RelationName = newNode.type === "criterion" ? "solves" : "criterion for";

  const newCriterionEdges = problemDiagram.edges
    .filter((edge) => edge.source === fromNode.id && edge.label === targetRelation)
    .map((edge) => {
      const targetNode = findNode(problemDiagram, edge.target);

      /* eslint-disable functional/immutable-data, no-param-reassign */
      const newCriterionEdgeId = `${state.nextEdgeId++}`;
      /* eslint-enable functional/immutable-data, no-param-reassign */

      const sourceNodeId = newNode.type === "criterion" ? newNode.id : targetNode.id;
      const targetNodeId = newNode.type === "criterion" ? targetNode.id : newNode.id;

      return buildEdge(
        newCriterionEdgeId,
        sourceNodeId,
        targetNodeId,
        "embodies",
        problemDiagramId
      );
    });

  return newCriterionEdges;
};

// trying to keep state changes directly within this method,
// but wasn't sure how to cleanly handle next node/edge id's without letting invoked methods use & mutate state for them
export const addNode = ({ fromNodeId, as, toNodeType, relation }: AddNodeProps) => {
  useTopicStore.setState(
    (state) => {
      const activeDiagram = getActiveDiagram(state);
      const fromNode = findNode(activeDiagram, fromNodeId);

      // create and connect node
      const [newNode, newEdge] = createAndConnectNode(state, {
        fromNodeId,
        as,
        toNodeType,
        relation,
      });

      // connect criteria
      if (["criterion", "solution"].includes(newNode.type) && fromNode.type === "problem") {
        const newCriterionEdges = connectCriteriaToSolutions(state, newNode, fromNode);

        /* eslint-disable functional/immutable-data, no-param-reassign */
        activeDiagram.edges.push(...newCriterionEdges);
        /* eslint-enable functional/immutable-data, no-param-reassign */
      }

      // re-layout
      const layoutedDiagram = layoutVisibleComponents({
        ...activeDiagram,
        nodes: activeDiagram.nodes.concat(newNode),
        edges: activeDiagram.edges.concat(newEdge),
      });

      // trigger event so viewport can be updated.
      // seems like there should be a cleaner way to do this - perhaps custom zustand middleware to emit for any action
      emitter.emit("addNode", findNode(layoutedDiagram, newNode.id));

      /* eslint-disable functional/immutable-data, no-param-reassign */
      activeDiagram.nodes = layoutedDiagram.nodes;
      activeDiagram.edges = layoutedDiagram.edges;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "addNode" // little gross, seems like this should be inferrable from method name
  );
};

export const connectNodes = (parentId: string | null, childId: string | null) => {
  useTopicStore.setState(
    (state) => {
      const activeDiagram = getActiveDiagram(state);

      const parent = activeDiagram.nodes.find((node) => node.id === parentId);
      const child = activeDiagram.nodes.find((node) => node.id === childId);
      if (!parent || !child) throw new Error("parent or child not found");

      if (!canCreateEdge(activeDiagram, parent, child)) return;

      /* eslint-disable functional/immutable-data, no-param-reassign */
      const newEdgeId = `${state.nextEdgeId++}`;
      /* eslint-enable functional/immutable-data, no-param-reassign */

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- canCreateEdge ensures relation is valid
      const relation = getRelation(parent.type, child.type)!;
      const newEdge = buildEdge(newEdgeId, parent.id, child.id, relation.name, activeDiagram.id);
      const newEdges = activeDiagram.edges.concat(newEdge);

      const layoutedDiagram = layoutVisibleComponents({ ...activeDiagram, edges: newEdges });

      /* eslint-disable functional/immutable-data, no-param-reassign */
      activeDiagram.nodes = layoutedDiagram.nodes;
      activeDiagram.edges = layoutedDiagram.edges;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "connectNodes"
  );
};

export const deselectNodes = () => {
  useTopicStore.setState(
    (state) => {
      const activeDiagram = getActiveDiagram(state);

      activeDiagram.nodes.forEach((node) => {
        // TODO: super jank - node.selected is always false, so setting to true ensures the change is fired (I think)
        // somehow returning { ...node, selected: false } without immer was actually working as well...
        // probably should change how we're using `selected`
        /* eslint-disable functional/immutable-data, no-param-reassign */
        node.selected = true;
        node.selected = false;
        /* eslint-enable functional/immutable-data, no-param-reassign */
      });
    },
    false,
    "deselectNodes"
  );
};

// score setting is way more work than it needs to be because one score can live in multiple places:
// - on the arguable
// - on the parent arguable (if this is a RootClaim)
// - on the child/implicit root claim (if it exists)
// keeping this in sync manually ain't great.
// TODO: store scores in one place
export const setScore = (arguableId: string, arguableType: ArguableType, score: Score) => {
  useTopicStore.setState(
    (state) => {
      // update this node's score
      const activeDiagram = getActiveDiagram(state);
      const arguable = findArguable(activeDiagram, arguableId, arguableType);
      /* eslint-disable functional/immutable-data, no-param-reassign */
      arguable.data.score = score;
      /* eslint-enable functional/immutable-data, no-param-reassign */

      // update parent arguable's score if this is a RootClaim
      if (arguable.type === "rootClaim") {
        const [parentArguableType, parentArguableId] = parseClaimDiagramId(activeDiagram.id);
        const parentArguable = findArguable(
          state.diagrams[problemDiagramId], // assuming we won't support nested root claims, so parent will always be root
          parentArguableId,
          parentArguableType
        );

        /* eslint-disable functional/immutable-data, no-param-reassign */
        parentArguable.data.score = score;
        /* eslint-enable functional/immutable-data, no-param-reassign */
      }

      // update implicit child claim's score if it exists
      const childDiagramId = getClaimDiagramId(arguableId, arguableType);
      if (doesDiagramExist(childDiagramId)) {
        const childDiagram = state.diagrams[childDiagramId];
        const childClaim = childDiagram.nodes.find((node) => node.type === "rootClaim");
        if (!childClaim) throw new Error("child claim not found");

        /* eslint-disable functional/immutable-data, no-param-reassign */
        childClaim.data.score = score;
        /* eslint-enable functional/immutable-data, no-param-reassign */
      }
    },
    false,
    "setScore"
  );
};

export const doesDiagramExist = (diagramId: string) => {
  return Object.keys(useTopicStore.getState().diagrams).includes(diagramId);
};

export const viewOrCreateClaimDiagram = (arguableId: string, arguableType: ArguableType) => {
  useTopicStore.setState(
    (state) => {
      const diagramId = getClaimDiagramId(arguableId, arguableType);

      // create claim diagram if it doesn't exist
      if (!doesDiagramExist(diagramId)) {
        const activeDiagram = getActiveDiagram(state);
        const arguable = findArguable(activeDiagram, arguableId, arguableType);
        const label = getImplicitLabel(arguableId, arguableType, activeDiagram);

        /* eslint-disable functional/immutable-data, no-param-reassign */
        const newNode = buildNode({
          id: `${state.nextNodeId++}`,
          label: label,
          score: arguable.data.score,
          type: "rootClaim",
          diagramId: diagramId,
        });

        state.diagrams[diagramId] = {
          id: diagramId,
          nodes: [newNode],
          edges: [],
          type: "claim",
        };
        /* eslint-enable functional/immutable-data, no-param-reassign */
      }

      /* eslint-disable functional/immutable-data, no-param-reassign */
      state.activeClaimDiagramId = diagramId;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "viewOrCreateClaimDiagram"
  );
};

export const viewClaimDiagram = (diagramId: string) => {
  useTopicStore.setState(
    (state) => {
      /* eslint-disable functional/immutable-data, no-param-reassign */
      state.activeClaimDiagramId = diagramId;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "viewClaimDiagram"
  );
};

export const closeClaimDiagram = () => {
  useTopicStore.setState(
    (state) => {
      /* eslint-disable functional/immutable-data, no-param-reassign */
      state.activeClaimDiagramId = null;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "closeClaimDiagram"
  );
};

export const closeTable = () => {
  useTopicStore.setState(
    (state) => {
      /* eslint-disable functional/immutable-data, no-param-reassign */
      state.activeTableProblemId = null;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "closeTable"
  );
};

export const setNodeLabel = (nodeId: string, value: string) => {
  useTopicStore.setState(
    (state) => {
      const activeDiagram = getActiveDiagram(state);
      const node = findNode(activeDiagram, nodeId);

      /* eslint-disable functional/immutable-data, no-param-reassign */
      node.data.label = value;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "setNodeLabel"
  );
};

export const toggleShowCriteria = (nodeId: string) => {
  useTopicStore.setState(
    (state) => {
      const problemDiagram = state.diagrams[problemDiagramId]; // criteria nodes only live in problem diagram

      const node = findNode(problemDiagram, nodeId);
      if (node.type !== "problem") throw new Error("node is not a problem");
      const problemNode = node as ProblemNode;

      /* eslint-disable functional/immutable-data, no-param-reassign */
      problemNode.data.showCriteria = !problemNode.data.showCriteria;
      /* eslint-enable functional/immutable-data, no-param-reassign */

      const layoutedDiagram = layoutVisibleComponents(problemDiagram); // depends on showCriteria having been updated

      /* eslint-disable functional/immutable-data, no-param-reassign */
      problemDiagram.nodes = layoutedDiagram.nodes;
      problemDiagram.edges = layoutedDiagram.edges;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "toggleShowCriteria"
  );
};

export const deleteNode = (nodeId: string) => {
  useTopicStore.setState(
    (state) => {
      const activeDiagram = getActiveDiagram(state);

      const node = findNode(activeDiagram, nodeId);

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

      const layoutedDiagram = layoutVisibleComponents(activeDiagram);

      /* eslint-disable functional/immutable-data, no-param-reassign */
      activeDiagram.nodes = layoutedDiagram.nodes;
      activeDiagram.edges = layoutedDiagram.edges;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "toggleShowCriteria"
  );
};

export const viewProblemDiagram = () => {
  useTopicStore.setState(
    (state) => {
      /* eslint-disable functional/immutable-data, no-param-reassign */
      state.activeTableProblemId = null;
      state.activeClaimDiagramId = null;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "viewProblemDiagram"
  );
};

export const viewCriteriaTable = (problemNodeId: string) => {
  useTopicStore.setState(
    (state) => {
      /* eslint-disable functional/immutable-data, no-param-reassign */
      state.activeTableProblemId = problemNodeId;
      state.activeClaimDiagramId = null;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "viewCriteriaTable"
  );
};
