import { type Edge, type Node } from "react-flow-renderer";
import create from "zustand";
import { devtools } from "zustand/middleware";

export type As = "Parent" | "Child";

interface BuildProps {
  id: string;
  x: number;
  y: number;
}
const buildNode = ({ id, x, y }: BuildProps) => {
  return {
    id: id,
    data: {
      label: `text${id}`,
    },
    position: { x: x, y: y },
    type: "editable",
  };
};

const initialNodes = [buildNode({ id: "0", x: 250, y: 25 })];

let nodeId = 1;
const nextNodeId = () => (nodeId++).toString();
let edgeId = 0;
const nextEdgeId = () => (edgeId++).toString();

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
          const yShift = as === "Parent" ? -100 : 100;
          const newNode = buildNode({
            id: newNodeId,
            x: toNode.position.x,
            y: toNode.position.y + yShift,
          });

          const newEdgeId = nextEdgeId();
          const sourceNode = as === "Parent" ? newNodeId : toNodeId;
          const targetNode = as === "Parent" ? toNodeId : newNodeId;
          const newEdge = { id: newEdgeId, source: sourceNode, target: targetNode };

          return { nodes: state.nodes.concat(newNode), edges: state.edges.concat(newEdge) };
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
