import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { NodeType } from "../components/nodeDecorations";
import { Direction, layout } from "../utils/layout";

export type NodeRelation = "Parent" | "Child";

interface BuildProps {
  id: string;
  type: NodeType;
}
const buildNode = ({ id, type }: BuildProps) => {
  return {
    id: id,
    data: {
      label: `text${id}`,
      score: "-" as Score,
      width: 300,
    },
    position: { x: 0, y: 0 }, // assume layout will adjust this
    selected: false,
    type: type,
  };
};
export type Node = ReturnType<typeof buildNode>;

function buildEdge(newEdgeId: string, sourceNodeId: string, targetNodeId: string) {
  return {
    id: newEdgeId,
    data: {
      score: "-" as Score,
    },
    source: sourceNodeId,
    target: targetNodeId,
    type: "ScoreEdge",
  };
}
export type Edge = ReturnType<typeof buildEdge>;

const getInitialNodes = (startingNodeType: NodeType) => {
  const { layoutedNodes: initialNodes } = layout(
    [buildNode({ id: "0", type: startingNodeType })],
    [],
    "TB"
  );

  return initialNodes;
};

export const rootId = "root";

const initialDiagrams: Record<string, DiagramState> = {
  [rootId]: {
    nodes: getInitialNodes("Problem"),
    edges: [],
    direction: "TB",
  },
};

interface AllDiagramState {
  diagrams: Record<string, DiagramState>;
  activeDiagramId: string;
  nextNodeId: number;
  nextEdgeId: number;
}

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  direction: Direction;
}

export type ComponentType = "node" | "edge";

export const possibleScores = ["-", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;
export type Score = typeof possibleScores[number];

const useDiagramStore = create<AllDiagramState>()(
  immer(
    devtools(() => ({
      diagrams: initialDiagrams,
      activeDiagramId: rootId,
      nextNodeId: 1, // 0 is taken by the initial node
      nextEdgeId: 0,
    }))
  )
);

export const useActiveDiagramId = () => {
  return useDiagramStore((state) => state.activeDiagramId);
};

export const useActiveDiagram = () => {
  return useDiagramStore((state) => state.diagrams[state.activeDiagramId]);
};

export const useActiveDirection = () => {
  return useDiagramStore((state) => state.diagrams[state.activeDiagramId].direction);
};

export const useClaimDiagramIds = () => {
  return useDiagramStore((state) => Object.keys(state.diagrams).filter((id) => id !== rootId));
};

export const addNode = (toNodeId: string, as: NodeRelation, type: NodeType) => {
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
        type: type,
      });

      const sourceNodeId = as === "Parent" ? newNodeId : toNodeId;
      const targetNodeId = as === "Parent" ? toNodeId : newNodeId;
      const newEdge = buildEdge(newEdgeId, sourceNodeId, targetNodeId);

      const newNodes = activeDiagram.nodes.concat(newNode);
      const newEdges = activeDiagram.edges.concat(newEdge);
      const { layoutedNodes, layoutedEdges } = layout(newNodes, newEdges, activeDiagram.direction);

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

export const doesDiagramExist = (diagramId: string) => {
  return Object.keys(useDiagramStore.getState().diagrams).includes(diagramId);
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

export const setActiveDiagram = (diagramId: string) => {
  useDiagramStore.setState(
    (state) => {
      // create new diagram if it doesn't exist
      if (!doesDiagramExist(diagramId)) {
        /* eslint-disable functional/immutable-data, no-param-reassign */
        state.diagrams[diagramId] = {
          nodes: getInitialNodes("RootClaim"),
          edges: [],
          direction: "LR",
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
