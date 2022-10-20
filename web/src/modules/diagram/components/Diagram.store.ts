import { type Edge } from "react-flow-renderer";
import create from "zustand";
import { devtools } from "zustand/middleware";

import { layout } from "../utils/layout";

export type As = "Parent" | "Child";

interface BuildProps {
  id: string;
}
const buildNode = ({ id }: BuildProps) => {
  return {
    id: id,
    data: {
      label: `text${id}`,
      width: 150,
    },
    position: { x: 0, y: 0 }, // assume layout will adjust this
    type: "editable",
  };
};
export type Node = ReturnType<typeof buildNode>;

const { layoutedNodes: initialNodes } = layout([buildNode({ id: "0" })], []);

/* eslint-disable functional/no-let */
let nodeId = 1;
const nextNodeId = () => (nodeId++).toString();
let edgeId = 0;
const nextEdgeId = () => (edgeId++).toString();
/* eslint-enable functional/no-let */

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  addNode: (_toNodeId: string, _as: As) => void;
  deselectNodes: () => void;
}
export const useDiagramStore = create<DiagramState>()(
  // seems like we should be able to auto-wrap all stores with devtools
  devtools((set) => ({
    nodes: initialNodes,
    edges: [],

    addNode: (toNodeId, as) => {
      set(
        (state) => {
          const toNode = state.nodes.find((node) => node.id === toNodeId);
          if (!toNode) throw new Error("toNode not found");

          const newNodeId = nextNodeId();
          const newNode = buildNode({
            id: newNodeId,
          });

          const newEdgeId = nextEdgeId();
          const sourceNode = as === "Parent" ? newNodeId : toNodeId;
          const targetNode = as === "Parent" ? toNodeId : newNodeId;
          const newEdge = { id: newEdgeId, source: sourceNode, target: targetNode };

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
  }))
);
