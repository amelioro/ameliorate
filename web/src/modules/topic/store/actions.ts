import { getClaimDiagramId, getImplicitLabel, parseClaimDiagramId } from "../utils/claim";
import {
  Edge,
  Node,
  RelationDirection,
  ScorableType,
  Score,
  buildEdge,
  buildNode,
  findScorable,
  orientations,
} from "../utils/diagram";
import { RelationName, canCreateEdge, getRelation } from "../utils/edge";
import { layout } from "../utils/layout";
import { NodeType } from "../utils/nodes";
import { AllDiagramState, rootId, useDiagramStore } from "./store";

interface AddNodeProps {
  fromNodeId: string;
  as: RelationDirection;
  toNodeType: NodeType;
  relation: RelationName;
}

const createAndConnectNode = (
  state: AllDiagramState,
  { fromNodeId, as, toNodeType, relation }: AddNodeProps
) => {
  /* eslint-disable functional/immutable-data, no-param-reassign */
  const newNodeId = `${state.nextNodeId++}`;
  const newEdgeId = `${state.nextEdgeId++}`;
  /* eslint-enable functional/immutable-data, no-param-reassign */

  const newNode = buildNode({ id: newNodeId, type: toNodeType, diagramId: state.activeDiagramId });

  const sourceNodeId = as === "Parent" ? newNodeId : fromNodeId;
  const targetNodeId = as === "Parent" ? fromNodeId : newNodeId;
  const newEdge = buildEdge(newEdgeId, sourceNodeId, targetNodeId, relation);

  return [newNode, newEdge] as [Node, Edge];
};

// if adding a criterion, connect to solutions
// if adding a solution, connect to criteria
const connectCriteriaToSolutions = (state: AllDiagramState, newNode: Node, fromNode: Node) => {
  const activeDiagram = state.diagrams[state.activeDiagramId];

  const targetRelation: RelationName = newNode.type === "criterion" ? "solves" : "criterion for";

  const newCriterionEdges = activeDiagram.edges
    .filter((edge) => edge.source === fromNode.id && edge.label === targetRelation)
    .map((edge) => {
      const targetNode = activeDiagram.nodes.find((node) => node.id === edge.target);
      if (!targetNode) throw new Error("targetNode not found");

      /* eslint-disable functional/immutable-data, no-param-reassign */
      const newCriterionEdgeId = `${state.nextEdgeId++}`;
      /* eslint-enable functional/immutable-data, no-param-reassign */

      const sourceNodeId = newNode.type === "criterion" ? newNode.id : targetNode.id;
      const targetNodeId = newNode.type === "criterion" ? targetNode.id : newNode.id;

      return buildEdge(newCriterionEdgeId, sourceNodeId, targetNodeId, "embodies");
    });

  return newCriterionEdges;
};

// trying to keep state changes directly within this method,
// but wasn't sure how to cleanly handle next node/edge id's without letting invoked methods use & mutate state for them
export const addNode = ({ fromNodeId, as, toNodeType, relation }: AddNodeProps) => {
  useDiagramStore.setState(
    (state) => {
      const activeDiagram = state.diagrams[state.activeDiagramId];

      const fromNode = activeDiagram.nodes.find((node) => node.id === fromNodeId);
      if (!fromNode) throw new Error("fromNode not found");

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
      const { layoutedNodes, layoutedEdges } = layout(
        activeDiagram.nodes.concat(newNode),
        activeDiagram.edges.concat(newEdge),
        orientations[activeDiagram.type]
      );

      /* eslint-disable functional/immutable-data, no-param-reassign */
      activeDiagram.nodes = layoutedNodes;
      activeDiagram.edges = layoutedEdges;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "addNode" // little gross, seems like this should be inferrable from method name
  );
};

export const connectNodes = (parentId: string | null, childId: string | null) => {
  useDiagramStore.setState(
    (state) => {
      const activeDiagram = state.diagrams[state.activeDiagramId];

      const parent = activeDiagram.nodes.find((node) => node.id === parentId);
      const child = activeDiagram.nodes.find((node) => node.id === childId);
      if (!parent || !child) throw new Error("parent or child not found");

      if (!canCreateEdge(activeDiagram, parent, child)) return;

      /* eslint-disable functional/immutable-data, no-param-reassign */
      const newEdgeId = `${state.nextEdgeId++}`;
      /* eslint-enable functional/immutable-data, no-param-reassign */

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- isValidEdge ensures relation is valid
      const relation = getRelation(parent.type, child.type)!;
      const newEdge = buildEdge(newEdgeId, parent.id, child.id, relation.name);
      const newEdges = activeDiagram.edges.concat(newEdge);

      const { layoutedNodes, layoutedEdges } = layout(
        activeDiagram.nodes,
        newEdges,
        orientations[activeDiagram.type]
      );

      /* eslint-disable functional/immutable-data, no-param-reassign */
      activeDiagram.nodes = layoutedNodes;
      activeDiagram.edges = layoutedEdges;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "connectNodes"
  );
};

export const deselectNodes = () => {
  useDiagramStore.setState(
    (state) => {
      const activeDiagram = state.diagrams[state.activeDiagramId];

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
// - on the scorable
// - on the parent scorable (if this is a RootClaim)
// - on the child/implicit root claim (if it exists)
// keeping this in sync manually ain't great.
// TODO: store scores in one place
export const setScore = (scorableId: string, scorableType: ScorableType, score: Score) => {
  useDiagramStore.setState(
    (state) => {
      // update this node's score
      const activeDiagram = state.diagrams[state.activeDiagramId];
      const scorable = findScorable(activeDiagram, scorableId, scorableType);
      /* eslint-disable functional/immutable-data, no-param-reassign */
      scorable.data.score = score;
      /* eslint-enable functional/immutable-data, no-param-reassign */

      // update parent scorable's score if this is a RootClaim
      if (scorable.type === "RootClaim") {
        const [parentScorableType, parentScorableId] = parseClaimDiagramId(state.activeDiagramId);
        const parentScorable = findScorable(
          state.diagrams[rootId], // assuming we won't support nested root claims, so parent will always be root
          parentScorableId,
          parentScorableType
        );

        /* eslint-disable functional/immutable-data, no-param-reassign */
        parentScorable.data.score = score;
        /* eslint-enable functional/immutable-data, no-param-reassign */
      }

      // update implicit child claim's score if it exists
      const childDiagramId = getClaimDiagramId(scorableId, scorableType);
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

const doesDiagramExist = (diagramId: string) => {
  return Object.keys(useDiagramStore.getState().diagrams).includes(diagramId);
};

export const setOrCreateActiveDiagram = (scorableId: string, scorableType: ScorableType) => {
  useDiagramStore.setState(
    (state) => {
      const diagramId = getClaimDiagramId(scorableId, scorableType);

      // create claim diagram if it doesn't exist
      if (!doesDiagramExist(diagramId)) {
        const activeDiagram = state.diagrams[state.activeDiagramId];
        const scorable = findScorable(activeDiagram, scorableId, scorableType);
        const label = getImplicitLabel(scorableId, scorableType, activeDiagram);

        /* eslint-disable functional/immutable-data, no-param-reassign */
        const newNode = buildNode({
          id: `${state.nextNodeId++}`,
          label: label,
          score: scorable.data.score,
          type: "rootClaim",
          diagramId: diagramId,
        });

        state.diagrams[diagramId] = {
          nodes: [newNode],
          edges: [],
          type: "Claim",
        };
        /* eslint-enable functional/immutable-data, no-param-reassign */
      }

      /* eslint-disable functional/immutable-data, no-param-reassign */
      state.activeDiagramId = diagramId;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "setOrCreateActiveDiagram"
  );
};

export const setActiveDiagram = (diagramId: string) => {
  useDiagramStore.setState(
    (state) => {
      if (!doesDiagramExist(diagramId)) {
        throw new Error("diagram does not exist");
      }

      /* eslint-disable functional/immutable-data, no-param-reassign */
      state.activeDiagramId = diagramId;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "setActiveDiagram"
  );
};

export const setNodeLabel = (nodeId: string, value: string) => {
  useDiagramStore.setState(
    (state) => {
      const activeDiagram = state.diagrams[state.activeDiagramId];

      const node = activeDiagram.nodes.find((node) => node.id === nodeId);
      if (!node) throw new Error("node not found");

      /* eslint-disable functional/immutable-data, no-param-reassign */
      node.data.label = value;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "setNodeLabel"
  );
};

export const getState = () => {
  return useDiagramStore.getState();
};

export const setState = (state: AllDiagramState) => {
  useDiagramStore.setState(() => state);
};
