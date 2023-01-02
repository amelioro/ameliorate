import { MarkerType } from "reactflow";

import { Orientation } from "./layout";
import { NodeType, RelationName } from "./nodes";

export type DiagramType = "Problem" | "Claim";
export type RelationDirection = "Parent" | "Child";

export const orientations: Record<DiagramType, Orientation> = {
  Problem: "TB",
  Claim: "LR",
};

export interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  type: DiagramType;
}

interface BuildProps {
  id: string;
  label?: string;
  type: NodeType;
  diagramId: string;
}
export const buildNode = ({ id, label, type, diagramId }: BuildProps) => {
  return {
    id: id,
    data: {
      label: label ?? `text${id}`,
      score: "-" as Score,
      width: 300,
      diagramId: diagramId,
    },
    position: { x: 0, y: 0 }, // assume layout will adjust this
    selected: false,
    type: type,
  };
};
export type Node = ReturnType<typeof buildNode>;

export const buildEdge = (
  newEdgeId: string,
  sourceNodeId: string,
  targetNodeId: string,
  relation: RelationName
) => {
  return {
    id: newEdgeId,
    data: {
      score: "-" as Score,
    },
    label: relation,
    // assumes that we always want to point from child to parent
    markerStart: { type: MarkerType.ArrowClosed, width: 30, height: 30 },
    source: sourceNodeId,
    target: targetNodeId,
    type: "ScoreEdge",
  };
};
export type Edge = ReturnType<typeof buildEdge>;

export type ScorableType = "node" | "edge";

export const possibleScores = ["-", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;
export type Score = typeof possibleScores[number];
