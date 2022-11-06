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
      score: "-" as PossibleScore,
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
      score: "-" as PossibleScore,
    },
    source: sourceNodeId,
    target: targetNodeId,
    type: "ScoreEdge",
  };
}
export type Edge = ReturnType<typeof buildEdge>;

const { layoutedNodes: initialNodes } = layout(
  [buildNode({ id: nextNodeId(), type: "Problem" })],
  []
);

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  addNode: (_toNodeId: string, _as: As, _type: NodeType) => void;
  deselectNodes: () => void;
  scoreParent: (parentId: string, parentType: ComponentType, score: PossibleScore) => void;
}

export type ComponentType = "node" | "edge";

export const possibleScores = ["-", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;
export type PossibleScore = typeof possibleScores[number];

export const useDiagramStore = create<DiagramState>()(
  // seems like we should be able to auto-wrap all stores with devtools
  devtools((set) => ({
    nodes: initialNodes,
    edges: [],

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
  }))
);
