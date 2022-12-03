import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { NodeType } from "../components/nodeDecorations";
import { Direction, layout } from "../utils/layout";

export type NodeRelation = "Parent" | "Child";

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
      width: 300,
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

const getInitialNodes = (startingNodeType: NodeType) => {
  const { layoutedNodes: initialNodes } = layout(
    [buildNode({ id: nextNodeId(), type: startingNodeType })],
    [],
    "TB"
  );

  return initialNodes;
};

const diagrams: Record<string, DiagramState> = {
  root: {
    nodes: getInitialNodes("Problem"),
    edges: [],
    direction: "TB",
  },
};

const doesDiagramExist = (diagramId: string) => {
  return Object.keys(diagrams).includes(diagramId);
};

interface AllDiagramState {
  activeDiagramId: string;
  rootDiagramId: string;
  claimDiagramIds: string[];
}

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  direction: Direction;
}

export type ComponentType = "node" | "edge";

export const possibleScores = ["-", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;
export type Score = typeof possibleScores[number];

interface DiagramActions {
  addNode: (_toNodeId: string, _as: NodeRelation, _type: NodeType) => void;
  deselectNodes: () => void;
  doesDiagramExist: (diagramId: string) => boolean;
  scoreParent: (parentId: string, parentType: ComponentType, score: Score) => void;
  setActiveDiagram: (diagramId: string) => void;
  setNodeLabel: (nodeId: string, value: string) => void;
}

// TODO: reorganize so that lint errors are more specific; right now, any error in this invocation
// seems to report all lines in the invocation, making it very hard to debug.
export const useDiagramStore = create<AllDiagramState & DiagramState & DiagramActions>()(
  // seems like we should be able to auto-wrap all stores with devtools

  immer(
    devtools((set, get) => ({
      activeDiagramId: "root",
      rootDiagramId: "root",
      claimDiagramIds: [],
      nodes: diagrams.root.nodes,
      edges: diagrams.root.edges,
      direction: diagrams.root.direction,

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
            const { layoutedNodes, layoutedEdges } = layout(newNodes, newEdges, state.direction);
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

      doesDiagramExist: doesDiagramExist,

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
            diagrams[get().activeDiagramId].nodes = get().nodes; // get() because diagrams exist outside of this immer'd method and should not take draft state outside of this scope
            diagrams[get().activeDiagramId].edges = get().edges;
            /* eslint-enable functional/immutable-data */

            // create new diagram if it doesn't exist
            if (!doesDiagramExist(diagramId)) {
              // TODO: perhaps we could use classes to isolate/indicate state & state change?
              // eslint-disable-next-line functional/immutable-data
              diagrams[diagramId] = {
                nodes: getInitialNodes("RootClaim"),
                edges: [],
                direction: "LR",
              };

              const claimDiagramIds = state.claimDiagramIds.concat(diagramId);
              return { activeDiagramId: diagramId, ...diagrams[diagramId], claimDiagramIds };
            }

            // set diagram
            return { activeDiagramId: diagramId, ...diagrams[diagramId] };
          },
          false,
          "setActiveDiagram"
        );
      },

      setNodeLabel: (nodeId, value) => {
        set(
          (state) => {
            const newNodes = state.nodes.map((node) => {
              if (node.id === nodeId) {
                return { ...node, data: { ...node.data, label: value } };
              }
              return node;
            });
            return { nodes: newNodes };
          },
          false,
          "setNodeLabel"
        );
      },
    }))
  )
);
