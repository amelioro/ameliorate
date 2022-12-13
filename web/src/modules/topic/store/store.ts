import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { type Edge, type Node, getInitialNodes } from "../utils/diagram";
import { Direction } from "../utils/layout";

export const rootId = "root";

const initialDiagrams: Record<string, DiagramState> = {
  [rootId]: {
    nodes: getInitialNodes("Problem", rootId),
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

export const useDiagramStore = create<AllDiagramState>()(
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

export const useDiagramDirection = (diagramId: string) => {
  return useDiagramStore((state) => state.diagrams[diagramId].direction);
};

export const useClaimDiagramIds = () => {
  return useDiagramStore((state) => Object.keys(state.diagrams).filter((id) => id !== rootId));
};
