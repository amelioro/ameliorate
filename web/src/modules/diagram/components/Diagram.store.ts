import create from "zustand";
import { devtools } from "zustand/middleware";

import { layout } from "../utils/layout";
import { NodeType } from "./nodeDecorations";

export type As = "Parent" | "Child";

// TODO: perhaps we could use classes to isolate/indicate state & state change?
/* eslint-disable functional/no-let */
let nodeId = 0;
const nextNodeId = () => (nodeId++).toString();
let edgeId = 0;
const nextEdgeId = () => (edgeId++).toString();
/* eslint-enable functional/no-let */

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
      width: 150,
    },
    position: { x: 0, y: 0 }, // assume layout will adjust this
    type: type,
  };
};
export type Node = ReturnType<typeof buildNode>;

function buildEdge(sourceNodeId: string, targetNodeId: string) {
  return {
    id: nextEdgeId(),
    data: {
      score: "-" as Score,
    },
    source: sourceNodeId,
    target: targetNodeId,
    type: "ScoreEdge",
  };
}
export type Edge = ReturnType<typeof buildEdge>;

const getInitialNodes = () => {
const { layoutedNodes: initialNodes } = layout(
  [buildNode({ id: nextNodeId(), type: "Problem" })],
  []
);

  return initialNodes;
};

// eh duplicate id, but key makes it easy to find in store and property makes it easy to check which diagram we're currently using
const diagrams: Record<string, DiagramState> = {
  root: {
    diagramId: "root",
    nodes: getInitialNodes(),
    edges: [],
  },
};

interface DiagramState {
  diagramId: string;
  nodes: Node[];
  edges: Edge[];
}

export type ComponentType = "node" | "edge";

export const possibleScores = ["-", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;
export type Score = typeof possibleScores[number];

interface DiagramActions {
  addNode: (_toNodeId: string, _as: As, _type: NodeType) => void;
  deselectNodes: () => void;
  scoreParent: (parentId: string, parentType: ComponentType, score: Score) => void;
  setActiveDiagram: (diagramId: string) => void;
}

export const useDiagramStore = create<DiagramState & DiagramActions>()(
  // seems like we should be able to auto-wrap all stores with devtools
  devtools((set) => ({
    diagramId: "root",
    nodes: diagrams.root.nodes,
    edges: diagrams.root.edges,

    addNode: (toNodeId, as, type) => {
      set(
        (state) => {
          const toNode = state.nodes.find((node) => node.id === toNodeId);
          if (!toNode) throw new Error("toNode not found");

          const newNodeId = nextNodeId();
          const newNode = buildNode({
            id: newNodeId,
            type: type,
          });

          const sourceNodeId = as === "Parent" ? newNodeId : toNodeId;
          const targetNodeId = as === "Parent" ? toNodeId : newNodeId;
          const newEdge = buildEdge(sourceNodeId, targetNodeId);

          const newNodes = state.nodes.concat(newNode);
          const newEdges = state.edges.concat(newEdge);
          const { layoutedNodes, layoutedEdges } = layout(newNodes, newEdges);
          return { nodes: layoutedNodes, edges: layoutedEdges };
        },
        false,
        "addNode" // little gross, seems like this should be inferrable from method name
      );
    },

    deselectNodes: () => {
      set(
        (state) => {
          const newNodes = state.nodes.map((node) => {
            return { ...node, selected: false };
          });
          return { nodes: newNodes };
        },
        false,
        "deselectNodes"
      );
    },

    // will this trigger re-render for all parentType components, since Diagram depends on the whole array?
    // theoretically we should be able to just re-render the affected component...
    // at least the HTML should mostly be unchanged I guess; not sure how big of a deal the performance impact is here
    scoreParent: (parentId, parentType, score) => {
      // immer seems like it'd make this a lot simpler https://github.com/pmndrs/zustand#sick-of-reducers-and-changing-nested-state-use-immer
      // state[parentsKey].data.score = score;
      set(
        (state) => {
          const parentsKey = parentType === "node" ? "nodes" : "edges";
          const parents = state[parentsKey];
          const newParents = parents.map((parent) => {
            if (parent.id === parentId) {
              return { ...parent, data: { ...parent.data, score: score } };
            }
            return parent;
          });
          return { [parentsKey]: newParents };
        },
        false,
        "scoreParent"
      );
    },

    setActiveDiagram: (diagramId) => {
      set(
        (state) => {
          // save current diagram state before switching
          // TODO: perhaps we could use classes to isolate/indicate state & state change?
          /* eslint-disable functional/immutable-data */
          diagrams[state.diagramId].nodes = state.nodes;
          diagrams[state.diagramId].edges = state.edges;
          /* eslint-enable functional/immutable-data */

          // create new diagram if it doesn't exist
          if (!Object.keys(diagrams).includes(diagramId)) {
            // TODO: perhaps we could use classes to isolate/indicate state & state change?
            // eslint-disable-next-line functional/immutable-data
            diagrams[diagramId] = {
              diagramId: diagramId,
              nodes: getInitialNodes(),
              edges: [],
            };
          }

          // set diagram
          return diagrams[diagramId];
        },
        false,
        "setActiveDiagram"
      );
    },
  }))
);
