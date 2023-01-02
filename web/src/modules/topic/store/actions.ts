import {
  ComponentType,
  Edge,
  Node,
  RelationDirection,
  Score,
  buildEdge,
  buildNode,
  getInitialNodes,
  orientations,
} from "../utils/diagram";
import { layout } from "../utils/layout";
import { NodeType, RelationName } from "../utils/nodes";
import { AllDiagramState, useDiagramStore } from "./store";

export const addNode = (
  toNodeId: string,
  as: RelationDirection,
  toNodeType: NodeType,
  relation: RelationName
) => {
  useDiagramStore.setState(
    (state) => {
      const activeDiagram = state.diagrams[state.activeDiagramId];

      const toNode = activeDiagram.nodes.find((node) => node.id === toNodeId);
      if (!toNode) throw new Error("toNode not found");

      /* eslint-disable functional/immutable-data, no-param-reassign */
      const newNodeId = `${state.nextNodeId++}`;
      const newEdgeId = `${state.nextEdgeId++}`;
      /* eslint-enable functional/immutable-data, no-param-reassign */

      const newNode = buildNode({
        id: newNodeId,
        type: toNodeType,
        diagramId: state.activeDiagramId,
      });

      const sourceNodeId = as === "Parent" ? newNodeId : toNodeId;
      const targetNodeId = as === "Parent" ? toNodeId : newNodeId;
      const newEdge = buildEdge(newEdgeId, sourceNodeId, targetNodeId, relation);

      const newNodes = activeDiagram.nodes.concat(newNode);
      const newEdges = activeDiagram.edges.concat(newEdge);
      const { layoutedNodes, layoutedEdges } = layout(
        newNodes,
        newEdges,
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

export const scoreParent = (parentId: string, parentType: ComponentType, score: Score) => {
  useDiagramStore.setState(
    (state) => {
      const activeDiagram = state.diagrams[state.activeDiagramId];

      const parentsKey = parentType === "node" ? "nodes" : "edges";
      // RIP typescript can't infer this https://github.com/microsoft/TypeScript/issues/33591#issuecomment-786443978
      const parents: (Node | Edge)[] = activeDiagram[parentsKey];
      const parent = parents.find((parent) => parent.id === parentId);
      if (!parent) throw new Error("parent not found");

      /* eslint-disable functional/immutable-data, no-param-reassign */
      parent.data.score = score;
      /* eslint-enable functional/immutable-data, no-param-reassign */
    },
    false,
    "scoreParent"
  );
};

const doesDiagramExist = (diagramId: string) => {
  return Object.keys(useDiagramStore.getState().diagrams).includes(diagramId);
};

export const setActiveDiagram = (diagramId: string) => {
  useDiagramStore.setState(
    (state) => {
      // create new diagram if it doesn't exist
      if (!doesDiagramExist(diagramId)) {
        /* eslint-disable functional/immutable-data, no-param-reassign */
        state.diagrams[diagramId] = {
          nodes: getInitialNodes(`${state.nextNodeId++}`, "RootClaim", diagramId),
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
